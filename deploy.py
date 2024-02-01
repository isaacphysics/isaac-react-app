#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# TODO eliminate differences between test and live - ETL, DB fresh build vs DB migration
import argparse
import re
import subprocess
import sys
import getpass

# Global flag, whether commands should be executed by this script or not
EXEC = False


class Site(object):
    PHY = 'phy'
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
    parser.add_argument('site', choices=[Site.ADA, Site.PHY, Site.BOTH])
    parser.add_argument('env', choices=['test', 'staging', 'dev', 'live', 'etl'])
    parser.add_argument('app', help="The app version target for this deployment. Examples master or v1.2.3")
    parser.add_argument('api', help="The api version target for this deployment")
    parser.add_argument('--exec', help="Whether the script should execute the commands itself after prompting the user", action='store_true')
    return parser.parse_args()


def validate_args(args):
    match = re.match(r'^\d+\.\d+\.\d+$', args['app'])
    if match:
        print(f"Error: the app param should be v{args['app']} not {args['app']}")
        sys.exit(1)

    if 'api' in args:
        return args

    app_ver_is_tag = re.match(r"^v\d+\.\d+\.\d+$", args['app'])
    if not app_ver_is_tag:
        api_ver = input("Please enter API version: ")
        args['api'] = api_ver

    return args


def ask_to_run_command(command, print_output=True, expected_nonzero_exit_codes: list = None, env_vars: dict = None, chunk_size=1024):
    if not EXEC:
        return input(f"{command}\n")

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
        output = ""
        return_code = None
        with subprocess.Popen(command, stdout=subprocess.PIPE, shell=True, env=env_vars if env_vars else None) as proc:
            stdout_data = []
            while True:
                chunk = proc.stdout.read(chunk_size)
                if not chunk:
                    break
                decoded_chunk = chunk.decode('utf-8', errors='replace')
                print(decoded_chunk, end='', flush=True)  # Print in real time
                stdout_data.append(decoded_chunk)  # Store for later

            return_code = proc.wait()
            output = ''.join(stdout_data)
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


def build_docker_image_for_version(ctx):
    print("\n# BUILD THE APP AND API")
    ask_to_run_command(f"./build-in-docker.sh {ctx['app']}{' ' + ctx['api'] if 'api' in ctx and ctx['api'] is not None else ''}")


def ask_for_old_api(ctx):
    if 'old_api' not in ctx or ctx['old_api'] is None:
        api_ver = input(f"Please enter old API version for {ctx['site']} {ctx['env']}: ")
        ctx['old_api'] = api_ver
        print("\n")


def update_config(ctx):
    print(f"# Update configuration files")
    ask_to_run_command(f"cd /local/data && ./fetch-isaac-sops-config.sh")
    print(f"# Decrypt configuration files")
    # GPG would normally prompt us for the key password, but it's not possible to answer that prompt through subprocess.run().
    # Instead, we ask for it here and pass it in to the subprocess as an environment variable.
    gpg_password = getpass.getpass("Enter password for SOPS GPG key: ")
    ask_to_run_command(f"cd /local/src/isaac-sops-config && ./deploy_in_docker.sh /local/data/keys/$(hostname)_gpg.ppk /local/src/isaac-sops-config /local/data/isaac-sops-config-decrypted {ctx['env']} {ctx['site']}", env_vars={"GPG_KEY_PASSWORD": gpg_password})


def run_db_migrations(ctx):
    ask_for_old_api(ctx)
    print("# New migrations from last release (please make sure that these have been updated):")
    ask_to_run_command(f"cd /local/src/isaac-api && git diff --name-only {ctx['old_api']} {ctx['api']} -- src/main/resources/db_scripts/migrations")
    print("# Print migration SQL to terminal (to copy)?")
    ask_to_run_command(f"cd /local/src/isaac-api && git diff --name-only {ctx['old_api']} {ctx['api']} -- src/main/resources/db_scripts/migrations | xargs cat")
    print("# If there are any DB migrations, run them (in a transaction with a BEGIN; ROLLBACK; or COMMIT;):")
    ask_to_run_command(f"docker exec -it {ctx['site']}-pg-{ctx['env']} psql -U rutherford")


def write_changelog():
    # TODO can get this from GitHub, given app and api versions
    input("\nWrite the changelog at https://github.com/isaacphysics/isaac-react-app/releases")


def bring_down_any_existing_containers(ctx):
    app_name_prefix = ctx['site'] + '-app-' + ctx['env'] + '-'
    print(f"# Find running {ctx['site']} {ctx['env']} versions:")
    ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}-", expected_nonzero_exit_codes=[1])
    print(f"# Bring them down using:")
    ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}- | xargs -- bash -c './compose {ctx['site']} {ctx['env']} $0 down -v'", expected_nonzero_exit_codes=[1])


def bring_up_the_new_containers(ctx):
    print(f"# Bring up the new {ctx['site']} {ctx['env']} containers:")
    ask_to_run_command(f"./compose {ctx['site']} {ctx['env']} {ctx['app']} up -d")


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
    continue_anyway = not ctx['live'] or 'y' == input("Currently deploying the live site, do you want to deploy staging?[y/n] ").lower()
    if continue_anyway:
        update_config(ctx)
        run_db_migrations(ctx)
        bring_down_any_existing_containers(ctx)
        bring_up_the_new_containers(ctx)


def deploy_live(ctx):
    print(f"\n[DEPLOY {ctx['site'].upper()} LIVE]")

    app_name_prefix = f"{ctx['site']}-app-live-"
    previous_app_version = ""
    while previous_app_version == "":
        print("What is the previous app version? (i.e. v1.2.3)")
        previous_app_version = ask_to_run_command(
            "docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}-"
        ).rstrip()
    ctx['old_app'] = previous_app_version

    print("What is the previous api version? (i.e. v1.2.3)")
    previous_api_version = ask_to_run_command(
        f"docker inspect --format '{{{{ index .Config.Labels \"apiVersion\"}}}}' {app_name_prefix}{previous_app_version}"
    ).rstrip()
    ctx['old_api'] = previous_api_version

    response = input("Is this a front-end-only release? [front-end-only / n] ").lower()
    while response not in ["front-end-only", "n"]:
        response = input("Please respond with one of:\n - front-end-only \n - n\n").lower()
    front_end_only_release = response == "front-end-only"

    if front_end_only_release:
        print("# Front-end-only release - confirm which API this app image expects:")
        expected_api = ask_to_run_command(f"docker inspect --format '{{{{ index .Config.Labels \"apiVersion\"}}}}' docker.isaacscience.org/isaac-{ctx['site']}-app:{ctx['app']}")

        print("# Front-end-only release - confirm the expected API is running:")
        ask_to_run_command(f"docker ps --format '{{{{.Names}}}}' | grep {ctx['site']}-api-live-{expected_api}")
    else:
        print("# List possibly-unused live apis:")
        ask_to_run_command(f"docker ps --format '{{{{ .Names }}}}' --filter name={ctx['site']}-api-live-* | grep -v {previous_api_version}", expected_nonzero_exit_codes=[1])
        print("# Bring down and remove the penultimate live api(s), if that is sensible, using something like:")
        ask_to_run_command(f"docker ps --format '{{{{ .Names }}}}' --filter name={ctx['site']}-api-live-* | grep -v {previous_api_version} | xargs -- bash -c 'docker stop $0 && docker rm $0'", expected_nonzero_exit_codes=[1])

        update_config(ctx)
        run_db_migrations(ctx)

        if 'api' not in ctx or ctx['api'] is None:
            ctx['api'] = input('What is the new api version? [v1.3.4 | master | some-branch] ')

        print("# Bring up the new api ready for the new app:")
        ask_to_run_command(f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-api-live-{ctx['api']}")

        print("# Wait until the api is up:")
        api_endpoint = f"https://{'adacomputerscience' if ctx['site'] == Site.ADA else 'isaacphysics'}.org/api/{ctx['api']}/api/info/segue_environment"
        expected_response = '\'{"segueEnvironment":"PROD"}\''
        ask_to_run_command(f'while [ "$(curl --silent {api_endpoint})" != {expected_response} ]; do echo "Waiting for API..."; sleep 1; done && echo "The API is up!"')

        print("# Let the monitoring service know there is a new api service to track:")
        ask_to_run_command("cd /local/src/isaac-monitor && ./monitor_services.py --generate --no-prompt && ./monitor_services.py --reload --no-prompt && cd -")

    print("# Bring up the new app and take down the old one:")
    ask_to_run_command(f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-app-live-{ctx['app']} && "
          "sleep 3 && "             
          f"docker stop {ctx['site']}-app-live-{previous_app_version} && "
          "../isaac-router/reload-router-config")
    print("# Bring down the old preview renderer and bring up the new one")
    ask_to_run_command(f"docker stop {ctx['site']}-renderer && docker rm {ctx['site']}-renderer && "
          f"./compose-live {ctx['site']} {ctx['app']} up -d {ctx['site']}-renderer")


def deploy_etl(ctx):
    print(f"\n[DEPLOY {ctx['site'].upper()} ETL]")
    continue_anyway = 'y' == input("If there are changes to the content model you might want to delay deploying ETL until any old APIs are down.\nDeploy now? [y/n] ").lower()
    if continue_anyway:
        print("# Bring down the old ETL service")
        previous_app_version = ctx['old_app'] if 'old_app' in ctx and ctx['old_app'] is not None else input("What was the previous app version? [v1.2.3] ")
        ask_to_run_command(f"./compose-etl {ctx['site']} {previous_app_version} down -v")
        print("# Bring up the new ETL service")
        ask_to_run_command(f"./compose-etl {ctx['site']} {ctx['app']} up -d")


if __name__ == '__main__':
    assert_using_a_tty()
    context = vars(parse_command_line_arguments())
    context = validate_args(context)

    EXEC = context['exec']

    context['live'] = context['env'] == 'live' # As env changes during live deployment

    print("\n# ! THIS SCRIPT IS STILL EXPERIMENTAL SO CHECK EACH COMMAND BEFORE EXECUTING IT !\n")
    check_repos_are_up_to_date()

    build_docker_image_for_version(context)

    sites = [Site.ADA, Site.PHY] if context['site'] == Site.BOTH else [context['site']]
    for site in sites:
        context['site'] = site
        if context['env'] == 'test':
            deploy_test(context)
        elif context['env'] in ('staging', 'dev'):
            deploy_staging_or_dev(context)
        elif context['env'] == 'live':
            context['env'] = 'staging'
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
