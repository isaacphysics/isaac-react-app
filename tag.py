#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# USAGE: python tag.py --app=minor --api=major
#
# TODO ./build-in-docker would be good to be triggered automatically on tag
# TODO support release candidate versions?
# TODO tag-in-docker might be cleaner if we could get the git auth working nicely

import argparse
import requests
import subprocess
import sys
import re

SEMVER_REGEX = re.compile(fr'^v(?P<major>\d+?).(?P<minor>\d+?).(?P<patch>\d+?)$')
react_api_env_var_name = 'REACT_APP_API_VERSION'
REACT_API_ENV_REGEX = re.compile(fr'{react_api_env_var_name}=(?P<version>.*)')
semver_options = {
    'major': 'Makes incompatible API changes',
    'minor': 'Adds (backwards-compatible) functionality',
    'patch': 'Makes (backwards-compatible) bug fixes',
    'none': 'Don\'t update this service'
}
_default_subprocess_options = {'shell': True, 'check': True, 'capture_output': True, 'text': True}
api_working_directory = '../isaac-api'
subprocess_options = {
    'app': dict({}, **_default_subprocess_options),
    'api': dict({'cwd': api_working_directory}, **_default_subprocess_options),
}

def assert_using_a_tty():
    if not sys.stdout.isatty():
        print("Error: Must run this method with a tty. If you're using windows try:\n" + f"winpty {' '.join(sys.argv)}")
        sys.exit(1)

def parse_command_line_arguments():
    parser = argparse.ArgumentParser(description='Tag the code ready for a release.\n' +
    	'; '.join(option.upper() + ': ' + description for option, description in semver_options.items()) + ".")
    parser.add_argument('--app', choices=['major', 'minor', 'patch'], help='Set the semver update type for the App')
    parser.add_argument('--api', choices=semver_options.keys(), help='Set the semver update type for the API')
    return parser.parse_args()

def ask_for_update_type_for(service_name):
    while True:
        user_response = input(f'Are the changes to the {service_name}: [0] NONE, [1] PATCH, [2] MINOR, or [3] MAJOR?\n')
        if len(user_response) != 1 and user_response not in ('0', '1', '2', '3'):
            print("Please respond either '0', '1', '2' or '3'")
        elif service_name == 'app' and user_response == '0':
            print("Our release procedure does not allow a new API to be released without an App update.")
        else:
            return {'0': 'none', '1': 'patch', '2': 'minor', '3': 'major'}[user_response]

def get_update_description_from_user(cli_input):
    # try to retrieve from command line args
    update_description = {'app': cli_args.app, 'api': cli_args.api}
    # else ask the user for them
    for service_name in ['app', 'api']:
        if update_description[service_name] is None:
            update_description[service_name] = ask_for_update_type_for(service_name)
    return update_description

def get_versions_from_github():
    return {
        'app': requests.get('https://api.github.com/repos/isaacphysics/isaac-react-app/tags').json()[0]['name'],
        'api': requests.get('https://api.github.com/repos/isaacphysics/isaac-api/tags').json()[0]['name'],
    }

def get_build_results_from_github(repo, branch):
    conclusion = 'unknown'
    link = None
    try:
        if repo == 'api':
            result = requests.get(f"https://api.github.com/repos/isaacphysics/isaac-api/actions/workflows/maven.yml/runs?branch={branch}").json()['workflow_runs'][0]
            conclusion = result['conclusion']
            link = result['html_url']
        elif repo == 'app':
            result = requests.get(f"https://api.github.com/repos/isaacphysics/isaac-react-app/actions/workflows/node.js.yml/runs?branch={branch}").json()['workflow_runs'][0]
            conclusion = result['conclusion']
            link = result['html_url']
    except Exception as e:
        print(f"Failed to fetch build results from GitHub: {e}")
    return conclusion, link

def increment_version(update_type):
    def repl_matcher(match):
        if update_type != 'none':
            version = {'major': int(match.group('major')), 'minor': int(match.group('minor')), 'patch': int(match.group('patch'))}
            version_order = ['major', 'minor', 'patch']
            for ver in version_order:
                if version_order.index(update_type) < version_order.index(ver):
                    version[ver] = 0
                elif ver == update_type:
                    version[ver] += 1
            return f"v{version['major']}.{version['minor']}.{version['patch']}"
        else:
            return match.group(0)
    return repl_matcher

def update_versions(previous_versions, update_description, snapshot=False):
    update_versions = {}
    for service_name in ['app', 'api']:
        service_update_description = update_description[service_name]
        update_versions[service_name] = \
            SEMVER_REGEX.sub(increment_version(service_update_description), previous_versions[service_name])
        if snapshot:
            update_versions[service_name] += "-SNAPSHOT"
    return update_versions

def prompt_user(prompt, warning=True, continue_string='Continue anyway?'):
    print(f'{"Warning: " if warning else ""}{prompt}')
    acknowledged = False
    while not acknowledged:
        user_response = input(f'{continue_string} [y/n]\n')
        if user_response.lower() == 'n':
            sys.exit(1)
        elif user_response.lower() == 'y':
            acknowledged = True

def check_app_and_api_are_clean(update_description):
    for service_name in ['app', 'api']:
        if update_description[service_name] != 'none':
            branch = subprocess.run("git rev-parse --abbrev-ref HEAD", **subprocess_options[service_name]).stdout.strip()
            if branch != 'master':
                prompt_user(f'The {service_name} repo is not on the "master" branch.')

            build_conclusion, build_link = get_build_results_from_github(service_name, branch)
            if build_conclusion != 'success':
                prompt_user(f'The last remote build for branch "{branch}" of {service_name} finished with status "{build_conclusion}"!: {build_link}')

            subprocess.run("git fetch", **subprocess_options[service_name])
            diff_with_remote = subprocess.run("git diff origin/master --name-only", **subprocess_options[service_name]).stdout.strip()
            if len(diff_with_remote) > 0:
                prompt_user(f'The {service_name} repo does not have the latest changes from the remote branch (i.e. you are not on master or you need to `git pull`).')

            status = subprocess.run("git status --short", **subprocess_options[service_name]).stdout.strip()
            if len(status) > 0:
                prompt_user(f'The {service_name} repo is reporting the following uncommitted changes or untracked files:\n{status}')

def check_user_is_ready_to_release(target_versions, update_description):
    front_end_only = update_description['api'] == 'none'
    confirmation_string = [f"Ready to tag a {'front-end-only' if front_end_only else 'full'} release:"]
    for service_name in ['app', 'api']:
        if update_description[service_name] != 'none':
            confirmation_string.append(f"{service_name.upper()} ({update_description[service_name]}) {target_versions[service_name]}")
    prompt_user("\n".join(confirmation_string), warning=False, continue_string="Continue?")

def set_versions(versions, update_description):
    # Record the App version
    # package.json
    subprocess.run(f"npm --no-git-tag-version version {versions['app']}", **subprocess_options['app'])
    
    # Record the API version
    if update_description['api'] != 'none':
        # .env
        if not versions['api'].endswith('-SNAPSHOT'):
            new_content = []
            with open('.env', 'r') as dot_env_file:
                new_content = [REACT_API_ENV_REGEX.sub(f"{react_api_env_var_name}={versions['api']}", line) for line in dot_env_file.readlines()]
            with open('.env', 'w') as dot_env_file:
                dot_env_file.writelines(new_content)

        # pom.xml
        subprocess.run(f"mvn versions:set-property -Dproperty=segue.version -DnewVersion={versions['api']} -DgenerateBackupPoms=false", **subprocess_options['api'])

def commit_and_tag_changes(versions, update_description):
    changed_files = {'app': 'package.json .env', 'api': 'pom.xml'}
    for service_name in ['app', 'api']:
        if update_description[service_name] != 'none':
            subprocess.run(f'git add {changed_files[service_name]}', **subprocess_options[service_name])
            subprocess.run(f'git commit -m "Release {versions[service_name]}"', **subprocess_options[service_name])
            subprocess.run(f'git tag -a {versions[service_name]} -m "Release {versions[service_name]}"', **subprocess_options[service_name])

def commit_and_push_changes(versions, update_description):
    changed_files = {'app': 'package.json', 'api': 'pom.xml'}
    for service_name in ['app', 'api']:
        if update_description[service_name] != 'none':
            subprocess.run(f'git add {changed_files[service_name]}', **subprocess_options[service_name])
            subprocess.run('git commit -m "Increment version"', **subprocess_options[service_name])
            subprocess.run('git push origin master', **subprocess_options[service_name])
            subprocess.run(f'git push origin {versions[service_name]}', **subprocess_options[service_name])


if __name__ == '__main__':
    assert_using_a_tty()

    cli_args = parse_command_line_arguments()
    update_description = get_update_description_from_user(cli_args)

    check_app_and_api_are_clean(update_description)

    most_recent_versions = get_versions_from_github()
    target_versions = update_versions(most_recent_versions, update_description)
    check_user_is_ready_to_release(target_versions, update_description)

    set_versions(target_versions, update_description)
    commit_and_tag_changes(target_versions, update_description)

    bump_update_description = {service: 'patch' if update != 'none' else 'none' for service, update in update_description.items()}
    bumped_versions = update_versions(target_versions, bump_update_description, snapshot=True)
    set_versions(bumped_versions, update_description)
    commit_and_push_changes(target_versions, update_description)

    print('Done!')