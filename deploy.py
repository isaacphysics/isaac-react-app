#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# TODO eliminate differences between test and live - ETL, DB fresh build vs DB migration
import argparse
import re
import subprocess
import sys
import getpass
from typing import Union

# Global flag, whether commands should be executed by this script or not
EXEC = False
DOCKER_REPO = "ghcr.io/isaacphysics"

class Site(object):
    PHY = 'phy'
    SCI =  'sci'
    ADA = 'ada'
    BOTH = 'both'


def assert_using_a_tty():
    if not sys.stdout.isatty():
        print("Error: Must run this method with a tty. If you're using windows try:\n" + f"winpty {' '.join(sys.argv)}")
        sys.exit(1)


def check_repos_are_up_to_date():
    print("# Git pull for the latest version of the deploy script and db schema:")
    ask_to_run_command("git pull && cd ../isaac-api && git pull && cd -")


def parse_command_line_arguments():
    parser = argparse.ArgumentParser(description='Deploy the site')
    parser.add_argument('site', choices=[Site.ADA, Site.PHY, Site.SCI, Site.BOTH])
    parser.add_argument('env', choices=['test', 'staging', 'dev', 'live', 'etl'])
    parser.add_argument('app', help="The app version target for this deployment. Examples master or v1.2.3")
    parser.add_argument('api', help="⚠️DEPRECATED The api version target for this deployment", nargs='?', default=None)
    parser.add_argument('--exec', help="Whether the script should execute the commands itself after prompting the user", action='store_true')
    return parser.parse_args()


def validate_args(args):
    match = re.match(r'^\d+\.\d+\.\d+$', args['app'])
    if match:
        print(f"Error: the app param should be v{args['app']} not {args['app']}")
        sys.exit(1)

    # Docker doesn't like it when ref contains a slash. When building on GHA we swap these with dashes, so we'll do that here too.
    args['app'] = args['app'].replace('/', '-')

    if 'api' in args and args['api'] is not None:
        print(f"WARNING ⚠️: The 'api' argument is deprecated and this value will be ignored. The API version is now derived from the app image. See https://github.com/isaacphysics/isaac-adrs/blob/main/7-automated-docker-builds.md for more info.\n")
        args['api'] = None

    return args


def ask_to_run_command(command,
                       print_output=True,
                       expected_nonzero_exit_codes: Union[list, None] = None,
                       env_vars: Union[dict, None] = None,
                       chunk_size=1024,
                       run_anyway=False):
    if not EXEC:
        return input(f"{command}\n")

    run = run_anyway
    if not run_anyway:
        response = input(f"Execute: {command}?: ").lower()
        while response not in ["y", "yes", "s", "skip", "a", "abort"]:
            response = input("Please respond with one of:\n - Yes (or y)\n - Skip (or s)\n - Abort (or a)\n").lower()

        if response in ["a", "abort"]:
            print("! Aborting release process, please clean up after yourself !")
            sys.exit(1)
        if response in ["s", "skip"]:
            print("Skipping command...")
            return
        if response in ["y", "yes"]:
            run = True

    if run:
        output = ""
        return_code = None
        with subprocess.Popen(command, stdout=subprocess.PIPE, shell=True, env=env_vars if env_vars else None) as proc:
            stdout_data = []
            while True:
                output = proc.stdout
                if output is None:
                    break

                chunk = output.read(chunk_size)
                if not chunk:
                    break
                decoded_chunk = chunk.decode('utf-8', errors='replace')
                print(decoded_chunk, end='', flush=True)  # Print in real time
                stdout_data.append(decoded_chunk)  # Store for later

            return_code = proc.wait()
            output = ''.join(stdout_data).strip()
        if return_code == 0:
            return output
        elif expected_nonzero_exit_codes and return_code in expected_nonzero_exit_codes:
            print(f"Command returned non-zero exit code {return_code} - this may not indicate an error (e.g. "
                  f"in the case of grep or git diff), but you should check subsequent commands carefully.")
            return output
        else:
            print(f"Command returned unexpected exit code {return_code}.")
            print("! There was an unexpected error, please clean up after yourself !")
            response = input(f"Continue, or Abort?: [c/a] ")

            while response.lower() not in ["c", "continue", "a", "abort"]:
                response = input("Please respond with one of:\n - Continue (or c)\n - Abort (or a)\n")
            if response in ["a", "abort"]:
                sys.exit(1)
            if response in ["c", "continue"]:
                print("Continuing...")
                return

def get_old_versions(ctx):
    if not ctx['previous_servers_exist']:
        return

    print("# Finding old versions")
    app_name_prefix = f"{ctx['site']}-app-live-"
    previous_app_version = ""

    if 'old_app' not in ctx or ctx['old_api'] is None or ('old_app_site' in ctx and ctx['old_app_site'] != ctx['site']):
        print("# Find the previous app version")
        while previous_app_version == "":
            previous_app_version = ask_to_run_command(
                "docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}-"
            )

            if previous_app_version is not None:
                previous_app_version = previous_app_version.rstrip()
            else:
                print("\n# ! UNABLE TO FIND PREVIOUS APP VERSION !\n")
                previous_app_version = input(f"Enter old APP version (e.g. v1.2.3) for {ctx['site']} {ctx['env']}: ")

        ctx['old_app'] = previous_app_version
        ctx['old_app_site'] = ctx['site']
    else:
        print(f"Inferring previous app version as {ctx['old_app']}")
        previous_app_version = ctx['old_app']

    if 'old_api' not in ctx or ctx['old_api'] is None:
        print("# Find the previous api version")
        previous_api_version = ask_to_run_command(
            f"docker inspect --format '{{{{ index .Config.Labels \"apiVersion\"}}}}' {app_name_prefix}{previous_app_version}"
        )

        if previous_api_version is not None:
            previous_api_version = previous_api_version.rstrip()
        else:
            print("\n# ! UNABLE TO FIND PREVIOUS API VERSION !\n")
            previous_api_version = input(f"Enter old API version (e.g. v1.2.3) for {ctx['site']} {ctx['env']}: ")

        ctx['old_api'] = previous_api_version


def update_config(ctx):
    print(f"# Update configuration files")
    ask_to_run_command(f"cd /local/data && ./fetch-isaac-sops-config.sh")
    print(f"# Decrypt configuration files")
    ask_to_run_command(f"cd /local/src/isaac-sops-config && ./deploy_in_docker.sh /local/data/keys/$(hostname)_gpg.ppk /local/src/isaac-sops-config /local/data/isaac-sops-config-decrypted {ctx['env']} {ctx['site']}")


def run_db_migrations(ctx):
    get_old_versions(ctx)
    print("# Print migration SQL to terminal (to copy)?")
    ask_to_run_command(f"cd /local/src/isaac-api && git diff --name-only {ctx['old_api']} {ctx['api']} -- src/main/resources/db_scripts/migrations | xargs cat")
    print("# If there are any DB migrations, run them (in a transaction with a BEGIN; ROLLBACK; or COMMIT;). The following should be run in a separate terminal:")
    print(f"docker exec -it {ctx['subject']}-pg-{ctx['env']} psql -U rutherford")


def write_changelog():
    # TODO can get this from GitHub, given app and api versions
    input("\nWrite the changelog at https://github.com/isaacphysics/isaac-react-app/releases")


def bring_down_any_existing_containers(ctx):
    app_name_prefix = ctx['site'] + '-app-' + ctx['env'] + '-'
    print(f"# Find running {ctx['site']} {ctx['env']} versions:")
    ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}-", expected_nonzero_exit_codes=[1])
    # TODO: only prompt if containers found
    print(f"# Bring them down using:")
    ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}- | xargs -L1 -- bash -c './compose {ctx['site']} {ctx['env']} $0 down -v'", expected_nonzero_exit_codes=[1])


def bring_up_the_new_containers(ctx):
    print(f"# Bring up the new {ctx['site']} {ctx['env']} containers:")
    ask_to_run_command(f"./compose {ctx['site']} {ctx['env']} {ctx['app']} up -d")


def check_running_servers(ctx):
    print("\n# Determining whether old services running\nMay return exit code 1.")

    api_running = ask_to_run_command(
        "docker ps --format '{{.Names}}' | grep api-live",
        expected_nonzero_exit_codes=[1],
        run_anyway=True
    )
    app_running = ask_to_run_command(
        "docker ps --format '{{.Names}}' | grep app-live",
        expected_nonzero_exit_codes=[1],
        run_anyway=True
    )
    previous_servers_exist = api_running != "" and app_running != ""
    ctx['previous_servers_exist'] = previous_servers_exist

    if not previous_servers_exist:
        print("# OLD CONTAINERS NOT FOUND.")
        print("\n# ! THIS SCRIPT WILL NOT TAKE DOWN ALL RUNNING CONTAINERS SO CLEAN UP OLD CONTAINERS AFTER !\n")
    else:
        print("# Old containers found.\n")


def volume_exists(ctx):
    print("\n# Determining whether necessary containers exist\nMay return exit code 1.")

    volume_grep = ask_to_run_command(
        "docker volume list | " + f"grep {ctx['subject']}-pg-{ctx['env']}",
        expected_nonzero_exit_codes=[1],
        run_anyway=True
    )
    volume_exists = volume_grep != ""

    if not volume_exists:
        print(f"\n# Could not find necessary volume {ctx['subject']}-pg-{ctx['env']}.")
        print(f"Create this volume if you want to deploy {ctx['env']}.")

    return volume_exists


def deploy_test(ctx):
    print(f"\n[DEPLOY {ctx['site'].upper()} TEST]")

    bring_down_any_existing_containers(ctx)
    print("Note: If there is a database schema change, you might need to alter the default data - usually through a migration followed by a snapshot.")
    print("# Reset the test database.")
    ask_to_run_command(f"./clean-test-db.sh {ctx['site']}")
    update_config(ctx)
    bring_up_the_new_containers(ctx)


def deploy_staging_or_dev(ctx):
    print(f"\n[DEPLOY {ctx['site'].upper()} {ctx['env'].upper()}]")
    continue_anyway = not ctx['live'] or 'y' == input("Currently deploying the live site, do you want to deploy staging? [y/n] ").lower()
    if continue_anyway:
        update_config(ctx)

        if ctx['previous_servers_exist']:
            run_db_migrations(ctx)

        bring_down_any_existing_containers(ctx)
        bring_up_the_new_containers(ctx)


def deploy_live(ctx):
    print(f"\n[DEPLOY {ctx['site'].upper()} LIVE]")

    get_old_versions(ctx)

    response = input("Is this a front-end-only release? [front-end-only / n] ").lower()
    while response not in ["front-end-only", "n"]:
        response = input("Please respond with one of:\n - front-end-only \n - n\n").lower()
    front_end_only_release = response == "front-end-only"

    if front_end_only_release:
        print("# Front-end-only release - confirm the expected API is running:")
        ask_to_run_command(f"docker ps --format '{{{{.Names}}}}' | grep {ctx['site']}-api-live-{ctx['api']}")
    else:
        if ctx['previous_servers_exist']:
            print("# List possibly-unused live apis:")
            ask_to_run_command(f"docker ps --format '{{{{ .Names }}}}' --filter name={ctx['site']}-api-live-* | grep -v {ctx['old_api']}", expected_nonzero_exit_codes=[1])
            # TODO: only prompt if containers found
            print("# Bring down and remove the penultimate live api(s), if that is sensible, using something like:")
            ask_to_run_command(f"docker ps --format '{{{{ .Names }}}}' --filter name={ctx['site']}-api-live-* | grep -v {ctx['old_api']} | xargs -L1 -- bash -c 'docker stop $0 && docker rm $0'", expected_nonzero_exit_codes=[1])

        update_config(ctx)

        if ctx['previous_servers_exist']:
            run_db_migrations(ctx)

        print("# Bring up the new api ready for the new app:")
        ask_to_run_command(f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-api-live-{ctx['api']}")

        print("# Wait until the api is up:")
        domain = {Site.PHY: 'isaacphysics', Site.ADA: 'adacomputerscience', Site.SCI: 'isaacscience'}[ctx['site']]
        api_endpoint = f"https://{domain}.org/api/{ctx['api']}/api/info/segue_environment"
        expected_response = '\'{"segueEnvironment":"PROD"}\''
        ask_to_run_command(f'while [ "$(curl --silent {api_endpoint})" != {expected_response} ]; do echo "Waiting for API..."; sleep 1; done && echo "The API is up!"')

        if ctx['previous_servers_exist']:
            print("# Let the monitoring service know there is a new api service to track:")
            ask_to_run_command("cd /local/src/isaac-monitor && ./monitor_services.py --generate --no-prompt && ./monitor_services.py --reload --no-prompt && cd -", run_anyway=True)

    if ctx['previous_servers_exist']:
        print(f"# Bring up the new app and take down the old one:")
        ask_to_run_command(f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-app-live-{ctx['app']} && "
              "sleep 3 && "
              f"docker stop {ctx['site']}-app-live-{ctx['old_app']} && "
              "../isaac-router/reload-router-config")
        print("# Bring down the old preview renderer and bring up the new one")
        ask_to_run_command(f"docker stop {ctx['site']}-renderer && docker rm {ctx['site']}-renderer && "
          f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-renderer")
    else:
        print(f"# Bring up the new app:")
        ask_to_run_command(f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-app-live-{ctx['app']} && "
              "../isaac-router/reload-router-config")
        print("# Bring up the new preview renderer")
        ask_to_run_command(f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-renderer")


def deploy_etl(ctx):
    print(f"\n[DEPLOY {ctx['site'].upper()} ETL]")
    continue_anyway = 'y' == input("If there are changes to the content model you might want to delay deploying ETL until any old APIs are down.\nDeploy now? [y/n] ").lower()
    if continue_anyway:
        if ctx['previous_servers_exist']:
            print("# Bring down the old ETL service")
            get_old_versions(ctx)
            ask_to_run_command(f"./compose-etl {ctx['site']} {ctx['old_app']} down -v")
        print("# Bring up the new ETL service")
        ask_to_run_command(f"./compose-etl {ctx['site']} {ctx['app']} up -d")

def get_target_api_version_from_app_image(ctx):
    print(f"# Pull App image for {ctx['app']}")
    ask_to_run_command(f"docker pull {DOCKER_REPO}/isaac-{ctx['subject']}-app:{ctx['app']}")

    print(f"# Get target API version from App image")
    ctx['api'] = ask_to_run_command(f"docker inspect --format '{{{{ index .Config.Labels \"apiVersion\"}}}}' {DOCKER_REPO}/isaac-{ctx['subject']}-app:{ctx['app']}", run_anyway=True)


if __name__ == '__main__':
    assert_using_a_tty()
    initial_context = vars(parse_command_line_arguments())
    initial_context = validate_args(initial_context)

    EXEC = initial_context['exec']

    initial_context['live'] = initial_context['env'] == 'live' # As env changes during live deployment

    check_repos_are_up_to_date()

    check_running_servers(initial_context)

    sites = [Site.ADA, Site.SCI] if initial_context['site'] == Site.BOTH else [initial_context['site']]
    for site in sites:
        context = initial_context.copy()
        context['site'] = site
        context['subject'] = 'ada' if context['site'] == Site.ADA else 'phy'
        get_target_api_version_from_app_image(context)
        if context['env'] == 'test' and volume_exists(context):
            deploy_test(context)
        elif context['env'] in ('staging', 'dev') and volume_exists(context):
            deploy_staging_or_dev(context)
        elif context['env'] == 'live':
            if context['previous_servers_exist']:
                print("# Bring down test containers")
                context['env'] = 'test'
                bring_down_any_existing_containers(context)
            context['env'] = 'staging'
            if volume_exists(context):
                deploy_staging_or_dev(context)
            context['env'] = 'live'
            deploy_live(context)
            context['env'] = 'etl'
            deploy_etl(context)
            context['env'] = 'live'
            write_changelog()
        elif context['env'] == 'etl':
            deploy_etl(context)
    print('\nDone!')
