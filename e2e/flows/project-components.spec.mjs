import { seed } from '../api.mjs';
import { test, expect, login } from '../test.mjs';

test('show the occurrences of a component', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Occurrences' }).check();
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .getByRole('button', { name: '1', exact: true })
    .click();
  const modal = page.getByRole('dialog', {
    name: 'Occurrences of component jackson-core',
  });
  await expect(modal).toContainText('lib/jackson-core-2.13.2.jar');
});

test('show the vulnerabilities of a component by severity', async ({
  page,
}) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  const bar = page
    .getByRole('row')
    .filter({ hasText: 'jackson-databind' })
    .getByRole('progressbar', { name: 'Severity' })
    .filter({ visible: true })
    .first();
  await expect(bar).toHaveAttribute(
    'aria-valuetext',
    /^Critical: \d+, High: \d+, Medium: \d+, Low: \d+, Unassigned: \d+$/,
  );
  await bar.hover();
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Severity' }),
  ).toBeVisible();
});

test('verify the hashes of a component', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('checkbox', { name: 'Integrity' }).check();
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .getByRole('button', { name: 'Hashes match' })
    .click();
  const modal = page.getByRole('dialog', { name: 'Hash verification' });
  await expect(modal).toContainText('0a6a0e0620d51833feffc67bccb51937b2345763');
});

test('show a latest version with a quote in its tooltip', async ({ page }) => {
  const latest = '99.0" onmouseover="alert(1)';
  await page.route('**/api/v2/projects/*/components?*', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    for (const item of json.items) {
      item.package_metadata = { latest_version: latest };
    }
    await route.fulfill({ response, json });
  });
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' })
    .locator('.fa-exclamation-triangle')
    .hover();
  await expect(page.getByRole('tooltip')).toContainText(latest);
});

test('link a component to the dependency graph', async ({ page }) => {
  const { project } = seed();
  await login(page);
  await page.goto(`projects/${project.uuid}/components`);
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'jackson-core' })
      .getByRole('link')
      .filter({ has: page.locator('.fa-sitemap') }),
  ).toHaveAttribute('href', /\/dependencyGraph\//);
});

test('expand and collapse licenses for one component', async ({ page }) => {
  const { project } = seed();

  await login(page);
  await page.goto(`projects/${project.uuid}/components`);

  const row = page.getByRole('row').filter({ hasText: 'jackson-databind' });

  const toggle = row.getByRole('button', {
    name: /Apache License 2\.0.*\+1/i,
  });

  const apacheLicense = row.getByRole('link', {
    name: 'Apache License 2.0',
    exact: true,
  });

  const mitLicense = row.getByRole('link', {
    name: 'MIT License',
    exact: true,
  });

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(apacheLicense).toBeHidden();
  await expect(mitLicense).toBeHidden();

  await toggle.click();

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(apacheLicense).toBeVisible();
  await expect(mitLicense).toBeVisible();

  await toggle.click();

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(apacheLicense).toBeHidden();
  await expect(mitLicense).toBeHidden();
});

test('expand and collapse all component licenses', async ({ page }) => {
  const { project } = seed();

  await login(page);
  await page.goto(`projects/${project.uuid}/components`);

  const multipleLicenseRow = page
    .getByRole('row')
    .filter({ hasText: 'jackson-databind' });

  const singleLicenseRow = page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' });

  const noLicenseRow = page
    .getByRole('row')
    .filter({ hasText: 'jackson-annotations' });

  const apacheLicense = multipleLicenseRow.getByRole('link', {
    name: 'Apache License 2.0',
    exact: true,
  });

  const mitLicense = multipleLicenseRow.getByRole('link', {
    name: 'MIT License',
    exact: true,
  });

  const expandAll = page.getByRole('button', {
    name: 'Expand all licenses',
    exact: true,
  });

  await expect(apacheLicense).toBeHidden();
  await expect(mitLicense).toBeHidden();
  await expect(expandAll).toHaveAttribute('aria-pressed', 'false');

  await expandAll.click();

  await expect(apacheLicense).toBeVisible();
  await expect(mitLicense).toBeVisible();

  const collapseAll = page.getByRole('button', {
    name: 'Collapse all licenses',
    exact: true,
  });

  await expect(collapseAll).toBeVisible();
  await expect(collapseAll).toHaveAttribute('aria-pressed', 'true');

  await expect(
    singleLicenseRow.getByRole('link', {
      name: 'Apache License 2.0',
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    singleLicenseRow.getByRole('button', {
      name: /Apache License 2\.0/i,
    }),
  ).toHaveCount(0);

  await expect(noLicenseRow.getByText('-', { exact: true })).toBeVisible();

  await collapseAll.click();

  await expect(apacheLicense).toBeHidden();
  await expect(mitLicense).toBeHidden();

  await expect(
    page.getByRole('button', {
      name: 'Expand all licenses',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('show component licenses based on license count', async ({ page }) => {
  const { project } = seed();

  await login(page);
  await page.goto(`projects/${project.uuid}/components`);

  const multipleLicenseRow = page
    .getByRole('row')
    .filter({ hasText: 'jackson-databind' });

  const singleLicenseRow = page
    .getByRole('row')
    .filter({ hasText: 'jackson-core' });

  const noLicenseRow = page
    .getByRole('row')
    .filter({ hasText: 'jackson-annotations' });

  await expect(multipleLicenseRow).toBeVisible();
  await expect(singleLicenseRow).toBeVisible();
  await expect(noLicenseRow).toBeVisible();

  const multipleLicenseToggle = multipleLicenseRow.getByRole('button', {
    name: /Apache License 2\.0.*\+1/i,
  });

  await expect(multipleLicenseToggle).toBeVisible();

  await expect(
    singleLicenseRow.getByRole('link', {
      name: 'Apache License 2.0',
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    singleLicenseRow.getByRole('button', {
      name: /Apache License 2\.0/i,
    }),
  ).toHaveCount(0);

  await expect(noLicenseRow.getByText('-', { exact: true })).toBeVisible();

  await expect(
    noLicenseRow.getByRole('link', {
      name: /license/i,
    }),
  ).toHaveCount(0);

  await expect(
    noLicenseRow.getByRole('button', {
      name: /license/i,
    }),
  ).toHaveCount(0);
});
