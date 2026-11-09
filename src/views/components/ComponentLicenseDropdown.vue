<template>
  <span v-if="loading" class="text-muted">
    <span
      class="spinner-border spinner-border-sm"
      role="status"
      :aria-label="$t('message.loading')"
    ></span>
  </span>

  <span v-else-if="licenses.length === 0" class="text-muted">-</span>

  <router-link
    v-else-if="licenses.length === 1 && licenses[0].resolved_license"
    :to="licenseRoute(licenses[0])"
  >
    {{ licenseLabel(licenses[0]) }}
  </router-link>

  <a
    v-else-if="licenses.length === 1 && licenses[0].license_url"
    :href="licenses[0].license_url"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ licenseLabel(licenses[0]) }}
  </a>

  <span v-else-if="licenses.length === 1">
    {{ licenseLabel(licenses[0]) }}
  </span>

  <div v-else>
    <b-button
      size="sm"
      variant="link"
      class="license-toggle p-0 text-start"
      :aria-expanded="expanded"
      :aria-controls="collapseId"
      @click="expanded = !expanded"
    >
      {{ licenseLabel(licenses[0]) }}
      <span class="text-muted">+{{ licenses.length - 1 }}</span>
      <i
        class="fa ms-1"
        :class="expanded ? 'fa-caret-up' : 'fa-caret-down'"
        aria-hidden="true"
      ></i>
    </b-button>

    <b-collapse :id="collapseId" v-model="expanded" class="mt-2">
      <ul class="list-unstyled mb-0">
        <li v-for="license in licenses" :key="licenseKey(license)" class="mb-1">
          <router-link
            v-if="license.resolved_license"
            :to="licenseRoute(license)"
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

          <small v-if="license.acknowledgement" class="text-muted ms-1">
            ({{ license.acknowledgement }})
          </small>
        </li>
      </ul>
    </b-collapse>
  </div>
</template>

<script>
import eventBus from '@/shared/eventbus';
export default {
  name: 'ComponentLicenseDropdown',
  props: {
    componentUuid: {
      type: String,
      required: true,
    },
    initiallyExpanded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      expanded: false,
      expandAllRequested: this.initiallyExpanded,
      licenses: [],
      loaded: false,
      loading: false,
    };
  },
  computed: {
    collapseId() {
      return `component-licenses-${this.componentUuid}`;
    },
  },
  mounted() {
    eventBus.on('set-all-component-licenses-expanded', this.setExpanded);
    this.loadLicenses();
  },
  beforeUnmount() {
    eventBus.off('set-all-component-licenses-expanded', this.setExpanded);
  },
  methods: {
    async loadLicenses() {
      if (this.loaded || this.loading) {
        return;
      }

      this.loading = true;
      this.licenses = [];

      const url = `${this.$api.BASE_URL}/${this.$api.URL_V2_LICENSES}/${encodeURIComponent(
        this.componentUuid,
      )}`;

      let pageToken;

      try {
        do {
          const params = { limit: 100 };

          if (pageToken) {
            params.page_token = pageToken;
          }

          const response = await this.axios.get(url, { params });

          this.licenses.push(...(response.data.items || []));
          pageToken = response.data.next_page_token;
        } while (pageToken);

        this.loaded = true;
        this.expanded = this.expandAllRequested && this.licenses.length > 1;
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
    licenseRoute(license) {
      return `/licenses/${encodeURIComponent(
        license.resolved_license.license_id,
      )}`;
    },
    licenseKey(license) {
      return [
        license.ordinality,
        license.acknowledgement,
        this.licenseLabel(license),
      ].join(':');
    },
    setExpanded(expanded) {
      this.expandAllRequested = expanded;
      this.expanded = expanded && this.licenses.length > 1;
    },
  },
};
</script>

<style scoped>
.license-toggle {
  vertical-align: baseline;
}

.license-toggle:hover,
.license-toggle:focus {
  text-decoration: underline;
}
</style>
