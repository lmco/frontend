<template>
  <div>
    <b-button
      v-if="hasLicense && licenses.length > 1"
      size="sm"
      variant="link"
      class="p-0 text-start"
      :aria-expanded="expanded"
      :aria-controls="collapseId"
      @click="toggle"
    >
      {{ summary }}
      <i
        class="fa ms-1"
        :class="expanded ? 'fa-caret-up' : 'fa-caret-down'"
        aria-hidden="true"
      ></i>
    </b-button>

    <span v-else>{{ fallback }}</span>

    <b-collapse v-if="hasLicense" :id="collapseId" v-model="expanded" class="mt-2">
      <div v-if="loading" class="text-muted">
        {{ $t('message.loading') }}
      </div>

      <div v-else-if="licenses.length === 0" class="text-muted">-</div>

      <ul v-else class="list-unstyled mb-0">
        <li
          v-for="license in licenses"
          :key="licenseKey(license)"
          class="mb-1"
        >
          <router-link
            v-if="license.resolved_license"
            :to="{
              path: `/licenses/${encodeURIComponent(
                license.resolved_license.license_id,
              )}`,
            }"
          >
            {{ licenseLabel(license) }}
          </router-link>

          <a
            v-else-if="license.license_url"
            :href="license.license_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ licenseLabel(license) }}
          </a>

          <span v-else>
            {{ licenseLabel(license) }}
          </span>

          <small
            v-if="license.acknowledgement"
            class="text-muted ms-1"
          >
            ({{ license.acknowledgement }})
          </small>
        </li>
      </ul>
    </b-collapse>
  </div>
</template>

<script>
import common from '@/shared/common';

export default {
  name: 'ComponentLicenseDropdown',
  props: {
    componentUuid: {
      type: String,
      required: true,
    },
    initialLicense: {
      type: Object,
      default: null,
    },
    initialLicenseName: {
      type: String,
      default: null,
    },
    initialLicenseExpression: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      expanded: false,
      loaded: false,
      loading: false,
      licenses: [],
    };
  },
  computed: {
    hasLicense() {
      return Boolean(
        this.initialLicense?.license_id ||
          this.initialLicenseName ||
          this.initialLicenseExpression,
      );
    },
    collapseId() {
      return `component-licenses-${this.componentUuid}`;
    },
    summary() {
      return (
        this.initialLicense?.license_id ||
        this.initialLicenseName ||
        this.initialLicenseExpression
      );
    },
    fallback() {
      return '-';
    },
  },
  methods: {
    async toggle() {
      this.expanded = !this.expanded;

      if (this.expanded && !this.loaded && !this.loading) {
        await this.loadLicenses();
      }
    },
    async loadLicenses() {
      this.loading = true;

      const baseUrl = `${this.$api.BASE_URL}/${this.$api.URL_V2_LICENSES}/${encodeURIComponent(
        this.componentUuid,
      )}`;

      let pageToken;

      try {
        do {
          const url = common.setQueryParams(baseUrl, {
            limit: 100,
            page_token: pageToken,
          });
          const response = await this.axios.get(url);

          this.licenses.push(...(response.data.items || []));
          pageToken = response.data.next_page_token;
        } while (pageToken);

        this.loaded = true;
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      } finally {
        this.loading = false;
      }
    },
    licenseLabel(license) {
      return (
        license.resolved_license?.name ||
        license.resolved_license?.license_id ||
        license.license ||
        license.license_expression ||
        license.license_url ||
        '-'
      );
    },
    licenseKey(license) {
      return [
        license.ordinality,
        license.acknowledgement,
        this.licenseLabel(license),
      ].join(':');
    },
  },
};
</script>