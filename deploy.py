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
    input("Check isaac-react-app is up-to-date so that you're using the latest deploy script.")

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

def build_docker_image_for_version(app_version, api_version=None):
    print("# BUILD")
    input(f"./build-in-docker.sh {app_version}{' ' + api_version if api_version else ''}")

def update_config(env, site):
    # TODO check if there have been any new config values since last release
    input(f"Update config:\n/local/data/isaac-config/{site}/segue-config.{env}.properties")

def run_db_migrations(env, site):
    # TODO check if there are any migrations since the last release
    print("If there are any DB migrations, run them - preferably in a transaction - using:")
    input(f"docker exec -it {site}-pg-{env} psql -U rutherford")

def write_changelog():
    # TODO can get this from GitHub, given app and api versions
    input("Write changelog - https://github.com/isaacphysics/isaac-react-app/releases")

def bring_down_any_existing_containers(site, env):
    print(f"Bring down any existing {site} {env} containers")
    input("docker ps --format '{{.Names}}' | " + f"grep {site}-app-{env}- | cut -c{len(site + '-app-' + env + '-') + 1}- | xargs ./compose {site} {env} down -v")

def bring_up_the_new_containers(site, env, app):
    print(f"Bring up the new {site} {env} containers:")
    input(f"./compose {site} {env} {app} up -d")


def deploy_test(site, app):
    bring_down_any_existing_containers(site, 'test')
    print("Note: If there is a database schema change, you might need to alter the default data - usually through a migration followed by a snapshot.")
    print("Reset the test database.")
    input(f"./clean-test-db.sh {site}")
    bring_up_the_new_containers(site, 'test', app)

def deploy_staging_or_dev(env, site, app):
    print(f"# DEPLOY {env.upper()}")
    update_config(env, site)
    run_db_migrations(env, site)
    bring_down_any_existing_containers(site, env)
    bring_up_the_new_containers(site, env, app)

def deploy_live(site, app, api):
    print("# DEPLOY LIVE")
    front_end_only_release = input("Is this a front-end-only release? [y/n]").lower()
    if not front_end_only_release:
        # TODO figure out penultimate version
        print("Bring down the penultimate live api if that is sensible using something like:")
        input(f"docker stop {site}-api-live-vPEN.ULTI.MATE")
        print("And then the same adian but with the docker rm subcommand:")
        input(f"docker rm {site}-api-live-vPEN.ULTI.MATE")

        update_config('live', site)
        run_db_migrations('live', site)

        print("Bring up the api of the new app")
        input("./compose-live {site} {app} up -d {site}-api-live-{api}")

        print("Wait until the api is up - i.e. this command stops returning an error page")
        input(f"curl https://isaac{'computerscience' if site == 'cs' else 'physics'}.org/api/{api}/api/info/segue_environment")

        print("Let the monitoring service know there is a new api to query")
        input("cd /local/src/isaac-monitor && ./monitor_services.py --generate --no-prompt && ./monitor_services.py --reload --no-prompt && cd -")

    print("Bring up the new app and take down the old one")
    previous_app_version = ""
    while previous_app_version != "":
        previous_app_version = input(
            "What is the previous app version? (i.e. v1.2.3)"
            "docker ps --format '{{.Names}}' | " + f"grep {site}-app-live- | cut -c{len(site + '-app-live-') + 1}-")
    input(f"./compose-live {site} {app} up -d {site}-app-live-{app} && "
          f"docker stop {site}-app-live-{previous_app_version} && "
          "../isaac-router/reload-router-config")

def deploy_etl(site, app):
    print("# DEPLOY ETL")
    continue_anyway = 'y' == input("If there are changes to the content you might want to delay deploying ETL until any old APIs are down. Continue? [y/n]").lower()
    if continue_anyway:
        print("Bring down the old API")
        previous_app_version = input("What was the previous app version? [v1.2.3]")
        input(f"./compose-etl {site} {previous_app_version} down -v")
        print("Bring up the new API")
        input(f"./compose-etl {site} {app} up -d")


if __name__ == '__main__':
    assert_using_a_tty()
    context = vars(parse_command_line_arguments())
    validate_args(context)

    print("THIS SCRIPT IS STILL EXPERIMENTAL SO BE CAUTIOUS")
    print("Go to isaac-react-app on the live machine.\ncd /local/src/isaac-react-app")
    check_react_app_is_up_to_date()

    build_docker_image_for_version(context['app'], context['api'])

    sites = [Site.CS, Site.PHY] if context['site'] == Site.BOTH else [context['site']]
    for site in sites:
        if context['env'] == 'test':
            deploy_test(context['site'], context['app'])
        if context['env'] in ('staging', 'dev'):
            deploy_staging_or_dev(context['env'], context['site'], context['app'])
        if context['env'] == 'live':
            deploy_staging_or_dev('staging', context['site'], context['app'])
            deploy_live(context['site'], context['app'], context['api'])
            deploy_etl(context['site'], context['app'])
        if context['env'] == 'etl':
            deploy_etl(context['site'], context['app'])

    if context['env'] == 'live':
        write_changelog()

    print('Done!')
