import os.path
import subprocess
import argparse

def run(site: str, update_baselines: bool):
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
        "-e", f"CYPRESS_SITE={site}",
        "-e", f"CYPRESS_UPDATE_BASELINE={'true' if update_baselines else 'false'}",
        "-e", "CYPRESS_INTERNAL_BROWSER_CONNECT_TIMEOUT=300000",
        "-e", "CYPRESS_CACHE_FOLDER=/tests/.cache/Cypress",
        "cypress/browsers:node-20.14.0-chrome-125.0.6422.141-1-ff-126.0.1-edge-125.0.2535.85-1",
        "/tests/docker-entrypoint-vrt.sh"
    ])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run visual regression tests')
    parser.add_argument('site', type=str, choices=["ada", "phy"])
    parser.add_argument(
        '--update-baselines',
        action="store_true",
        help="If provided, the run's results will become the new baselines for you to include in your commit.",
    )

    args = parser.parse_args()
    run(site=args.site, update_baselines=args.update_baselines)
