#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# TODO eliminate differences between test and live - ETL, DB fresh build vs DB migration 
import argparse
import re
import sys

class Site(object):
    PHY = 'phy'
    CS = 'cs'
    BOTH = 'both'

def assert_using_a_tty():
    if not sys.stdout.isatty():
        print("Error: Must run this method with a tty. If you're using windows try:\n" + f"winpty {' '.join(sys.argv)}")
        sys.exit(1)

def check_react_app_is_up_to_date():
    print("# Git pull for the latest version of the deploy script:")
    ask_to_run_command("git pull")

def parse_command_line_arguments():
    parser = argparse.ArgumentParser(description='Deploy the site')
    parser.add_argument('site', choices=[Site.CS, Site.PHY, Site.BOTH])
    parser.add_argument('env', choices=['test', 'staging', 'dev', 'live', 'etl'])
    parser.add_argument('app', help="The app version target for this deployment. Examples master or v1.2.3")
    parser.add_argument('--api', help="The api version target for this deployment")
    return parser.parse_args()

def validate_args(args):
    match = re.match(r'^\d+\.\d+\.\d+$', args['app'])
    if match:
        print(f"Error: the app param should be v{args['app']} not {args['app']}")
        sys.exit(1)
    # TODO if app version is not in vX.X.X shape then ask for an api version

def ask_to_run_command(command):
    return input(f"{command}\n")

def build_docker_image_for_version(app_version, api_version=None):
    print("\n# BUILD THE APP AND API")
    ask_to_run_command(f"./build-in-docker.sh {app_version}{' ' + api_version if api_version else ''}")

def update_config(env, site):
    # TODO check if there have been any new config values since last release
    print("# If necessary, update config:")
    ask_to_run_command(f"sudo nano /local/data/isaac-config/{site}/segue-config.{env}.properties")

def run_db_migrations(env, site):
    # TODO check if there are any migrations since the last release
    print("# If there are any DB migrations, run them (in a transaction with a BEGIN; ROLLBACK; or COMMIT;):")
    ask_to_run_command(f"docker exec -it {site}-pg-{env} psql -U rutherford")

def write_changelog():
    # TODO can get this from GitHub, given app and api versions
    input("\nWrite the changelog at https://github.com/isaacphysics/isaac-react-app/releases")

def bring_down_any_existing_containers(site, env):
    app_name_prefix = site + '-app-' + env + '-'
    print(f"# Find running {site} {env} versions:")
    ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}-")
    print(f"# Bring them down using:")
    ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}- | xargs -- bash -c './compose {site} {env} $0 down -v'")

def bring_up_the_new_containers(site, env, app):
    print(f"# Bring up the new {site} {env} containers:")
    ask_to_run_command(f"./compose {site} {env} {app} up -d")


def deploy_test(site, app):
    print("\n[DEPLOY {site.upper()} TEST]")
    bring_down_any_existing_containers(site, 'test')
    print("Note: If there is a database schema change, you might need to alter the default data - usually through a migration followed by a snapshot.")
    print("# Reset the test database.")
    ask_to_run_command(f"./clean-test-db.sh {site}")
    bring_up_the_new_containers(site, 'test', app)

def deploy_staging_or_dev(env, site, app):
    print(f"\n[DEPLOY {site.upper()} {env.upper()}]")
    update_config(env, site)
    run_db_migrations(env, site)
    bring_down_any_existing_containers(site, env)
    bring_up_the_new_containers(site, env, app)

def deploy_live(site, app):
    print("\n[DEPLOY {site.upper()} LIVE]")
    front_end_only_release = 'y' == input("Is this a front-end-only release? [y/n]").lower()
    if not front_end_only_release:
        # TODO figure out penultimate version
        print("# Bring down the penultimate live api, if that is sensible, using something like:")
        ask_to_run_command(f"docker stop {site}-api-live-vPEN.ULTI.MATE")
        print("# And then the same again but with the docker rm subcommand:")
        ask_to_run_command(f"docker rm {site}-api-live-vPEN.ULTI.MATE")

        update_config('live', site)
        run_db_migrations('live', site)

        api_version = input('What is the new api version? [v1.3.4 | master | some-branch]')

        print("# Bring up the new api ready for the new app:")
        ask_to_run_command(f"./compose-live {site} {app} up -d {site}-api-live-{api_version}")

        print("# Wait until the api is up:")
        api_endpoint = f"https://isaac{'computerscience' if site == 'cs' else 'physics'}.org/api/{api_version}/api/info/segue_environment"
        expected_response = '\'{"segueEnvironment":"PROD"}\''
        ask_to_run_command(f'while [ "$(curl --silent {api_endpoint})" != {expected_response} ]; do echo "Waiting for API..."; sleep 1; done && echo "The API is up!"')

        print("# Let the monitoring service know there is a new api service to track:")
        ask_to_run_command("cd /local/src/isaac-monitor && ./monitor_services.py --generate --no-prompt && ./monitor_services.py --reload --no-prompt && cd -")

    app_name_prefix = f"{site}-app-live-"
    previous_app_version = ""
    while previous_app_version == "":
        print("What is the previous app version? (i.e. v1.2.3)")
        previous_app_version = ask_to_run_command("docker ps --format '{{.Names}}' | " + f"grep {app_name_prefix} | cut -c{len(app_name_prefix) + 1}-")
    print("# Bring up the new app and take down the old one:")
    ask_to_run_command(f"./compose-live {site} {app} up -d {site}-app-live-{app} && "
          "sleep 3 && "             
          f"docker stop {site}-app-live-{previous_app_version} && "
          "../isaac-router/reload-router-config")
    print("// Bring down the old preview renderer and bring up the new one")
    ask_to_run_command(f"docker stop {site}-renderer && docker rm {site}-renderer && "
          f"./compose-live {site} {app} up -d {site}-renderer")

def deploy_etl(site, app):
    print(f"\n[DEPLOY {site.upper()} ETL]")
    continue_anyway = 'y' == input("If there are changes to the content model you might want to delay deploying ETL until any old APIs are down.\nDeploy now? [y/n]").lower()
    if continue_anyway:
        print("# Bring down the old ETL service")
        previous_app_version = input("What was the previous app version? [v1.2.3]")
        ask_to_run_command(f"./compose-etl {site} {previous_app_version} down -v")
        print("# Bring up the new ETL service")
        ask_to_run_command(f"./compose-etl {site} {app} up -d")


if __name__ == '__main__':
    assert_using_a_tty()
    context = vars(parse_command_line_arguments())
    validate_args(context)

    print("\n# ! THIS SCRIPT IS STILL EXPERIMENTAL SO CHECK EACH COMMAND BEFORE EXECUTING IT !\n")
    print("# Go to isaac-react-app on the live machine:")
    ask_to_run_command("cd /local/src/isaac-react-app")
    check_react_app_is_up_to_date()

    build_docker_image_for_version(context['app'], context['api'])

    sites = [Site.CS, Site.PHY] if context['site'] == Site.BOTH else [context['site']]
    for site in sites:
        if context['env'] == 'test':
            deploy_test(site, context['app'])
        if context['env'] in ('staging', 'dev'):
            deploy_staging_or_dev(context['env'], site, context['app'])
        if context['env'] == 'live':
            deploy_staging_or_dev('staging', site, context['app'])
            deploy_live(site, context['app'])
            deploy_etl(site, context['app'])
        if context['env'] == 'etl':
            deploy_etl(site, context['app'])
    print('\nDone!')

    if context['env'] == 'live':
        write_changelog()