import os.path
import subprocess
import argparse

def run(site: str, update_baselines: bool, cypress_args):
    subprocess.run([
        "docker",
        "run",
        "--platform", "linux/amd64",
        "--rm",
        "-w", "/tests",
        "-v", "visual_testing_local:/tests",
        "-v", f"{os.path.abspath('docker-entrypoint-vrt.sh')}:/tests/docker-entrypoint-vrt.sh",
        "-v", f"{os.path.abspath('./src')}:/tests/src",
        "-v", f"{os.path.abspath('./package.json')}:/tests/package.json",
        "-v", f"{os.path.abspath('./yarn.lock')}:/tests/yarn.lock",
        "-v", f"{os.path.abspath('./tsconfig.json')}:/tests/tsconfig.json",
        "-v", f"{os.path.abspath('./cypress.config.ts')}:/tests/cypress.config.ts",
        "-v", f"{os.path.abspath('./cypress')}:/tests/cypress",
        "-v", f"{os.path.abspath('./config')}:/tests/config",
        "-v", f"{os.path.abspath('./public')}:/tests/public",
        "-v", f"{os.path.abspath('./index-sci.html')}:/tests/index-sci.html",
        "-v", f"{os.path.abspath('./index-ada.html')}:/tests/index-ada.html",
        "-e", f"CYPRESS_SITE={site}",
        "-e", f"CYPRESS_UPDATE_BASELINE={'true' if update_baselines else 'false'}",
        "-e", "CYPRESS_INTERNAL_BROWSER_CONNECT_TIMEOUT=300000",
        "-e", "CYPRESS_CACHE_FOLDER=/tests/.cache/Cypress",
        "cypress/browsers:node-22.21.0-chrome-141.0.7390.107-1-ff-144.0-edge-141.0.3537.92-1",
        "/tests/docker-entrypoint-vrt.sh",
        *cypress_args
    ])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run visual regression tests')
    parser.add_argument('site', type=str, choices=["ada", "sci"])
    parser.add_argument(
        '--update-baselines',
        action="store_true",
        help="If provided, the run's results will become the new baselines for you to include in your commit.",
    )

    args, unknown = parser.parse_known_args()
    run(site=args.site, update_baselines=args.update_baselines, cypress_args=unknown)
