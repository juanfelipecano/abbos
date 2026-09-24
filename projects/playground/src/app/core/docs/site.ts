/** Published package name, as consumers install and import it. */
export const PACKAGE_NAME = '@juanfelipecano/abbos';

/** Keep in sync with `projects/abbos/package.json`. */
export const LIBRARY_VERSION = '0.0.1';

const REPO = 'https://github.com/juanfelipecano/abbos';

export const SITE_LINKS = {
    repo: REPO,
    releases: `${REPO}/releases`,
    newIssue: `${REPO}/issues/new`,
    source: (path: string) => `${REPO}/tree/main/${path}`,
} as const;
