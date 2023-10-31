import * as path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

type PackageType = 'docker' | 'npm'

async function run() {
  const token = core.getInput('github-token')
  const client = github.getOctokit(token)

  const package_path = path.resolve(process.env.NODE_PACKAGE_PATH!)
  const package_spec = require(package_path)
  const package_type = core.getInput('github-package-type') as PackageType

  const [organization_name, package_name] = package_spec.name
    .replace('@', '')
    .split('/')

  try {
    const { data: packages } =
      await client.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
        org: organization_name,
        package_name: package_name,
        package_type: package_type,
        per_page: 1,
        page: 1
      })

    const version = packages.length > 0 ? packages[0].name : '0.0.0'

    switch (package_type) {
      case 'npm':
        // export the version
        core.exportVariable('GH_NODE_PACKAGE_VERSION', version)
      case 'docker':
        // export the version
        core.exportVariable('GH_DOCKER_IMAGE_VERSION', version)
    }
  } catch (error) {
    core.notice(error as Error)
  }
}

run()
