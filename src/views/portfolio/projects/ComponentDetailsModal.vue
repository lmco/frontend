<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('message.component_details')"
    @show="loadAssociatedLicenses"
  >
    <b-tabs>
      <b-tab active>
        <template v-slot:title
          ><i class="fa fa-cube"></i> {{ $t('message.identity') }}</template
        >
        <b-input-group-form-input
          id="component-name-input"
          input-group-size="mb-3"
          type="text"
          v-model="component.name"
          lazy="true"
          required="true"
          feedback="true"
          autofocus="false"
          :label="$t('message.component_name')"
          :tooltip="this.$t('message.component_name_desc')"
          :feedback-text="$t('message.required_component_name')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-version-input"
          input-group-size="mb-3"
          type="text"
          v-model="component.version"
          lazy="true"
          required="true"
          feedback="true"
          autofocus="false"
          :label="$t('message.version')"
          :tooltip="this.$t('message.component_version_desc')"
          :feedback-text="$t('message.required_component_version')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-group-input"
          input-group-size="mb-3"
          type="text"
          v-model="component.group"
          required="false"
          :label="$t('message.component_namespace_group_vendor')"
          :tooltip="this.$t('message.component_group_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        {{ $t('message.component_classification') }}
        <b-badge
          :variant="component.isInternal ? 'tab-total' : 'tab-info'"
          v-b-tooltip.hover="$t('message.component_classification_desc')"
          >{{ component.isInternal ? 'INTERNAL' : 'EXTERNAL' }}</b-badge
        >
        <p></p>
        <b-input-group-form-input
          id="component-author-input"
          input-group-size="mb-3"
          type="text"
          v-model="component.author"
          required="false"
          :label="$t('message.component_author')"
          :tooltip="this.$t('message.component_author_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-purl-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.purl"
          required="false"
          :label="$t('message.package_url_full')"
          :tooltip="this.$t('message.component_package_url_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-cpe-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.cpe"
          required="false"
          :label="$t('message.cpe_full')"
          :tooltip="$t('message.component_cpe_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-swidTagId-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.swidTagId"
          required="false"
          :label="$t('message.swid_tagid')"
          :tooltip="$t('message.component_swid_tagid_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-uuid"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.uuid"
          lazy="false"
          required="false"
          feedback="false"
          autofocus="false"
          disabled="true"
          :label="$t('message.object_identifier')"
          :tooltip="this.$t('message.object_identifier_desc')"
          :readonly="true"
        />
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-caret-square-o-right"></i>
          {{ $t('message.extended') }}</template
        >
        <b-input-group-form-select
          id="component-classifier-input"
          required="true"
          v-model="component.classifier"
          :options="sortAvailableClassifiers"
          :label="$t('message.classifier')"
          :tooltip="$t('message.component_classifier_desc')"
          :disabled="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-filename-input"
          input-group-size="mb-3"
          type="text"
          v-model="component.filename"
          required="false"
          :label="$t('message.filename')"
          :tooltip="$t('message.component_filename_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-form-group
          id="component-description-form-group"
          :label="this.$t('message.description')"
          label-for="component-description-input"
        >
          <b-form-textarea
            id="component-description-description"
            v-model="component.description"
            rows="3"
            :readonly="
              this.isNotPermitted([
                PERMISSIONS.PORTFOLIO_MANAGEMENT,
                PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
              ])
            "
          />
        </b-form-group>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-balance-scale"></i>
          {{ $t('message.legal') }}</template
        >
        <b-card>
          <div
            v-if="
              !associatedLicensesLoading &&
              associatedLicenses.length === 0
            "
            class="text-muted"
          >
            -
          </div>

          <div v-if="associatedLicensesLoading" class="text-muted mb-3">
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              :aria-label="$t('message.loading')"
            ></span>
          </div>

          <div
            v-for="license in associatedLicenses"
            :key="associatedLicenseKey(license)"
            class="mb-2"
          >
            <b-button
              variant="outline-secondary"
              class="w-100 text-start d-flex justify-content-between align-items-center"
              :aria-expanded="isLicenseExpanded(license)"
              :aria-controls="licenseCollapseId(license)"
              @click="toggleLicense(license)"
            >
              <span>
                {{ associatedLicenseLabel(license) }}
              </span>

              <i
                class="fa"
                :class="
                  isLicenseExpanded(license)
                    ? 'fa-chevron-up'
                    : 'fa-chevron-down'
                "
                aria-hidden="true"
              ></i>
            </b-button>

            <b-collapse
              :id="licenseCollapseId(license)"
              :model-value="isLicenseExpanded(license)"
              class="border border-top-0 rounded-bottom p-3"
            >
              <b-input-group-form-input
                :id="`${licenseCollapseId(license)}-license`"
                input-group-size="mb-3"
                type="text"
                v-model="license.license"
                :label="$t('message.license')"
              />

              <b-input-group-form-input
                :id="`${licenseCollapseId(license)}-expression`"
                input-group-size="mb-3"
                type="text"
                v-model="license.license_expression"
                :label="$t('message.license_expression')"
              />

              <b-input-group-form-input
                :id="`${licenseCollapseId(license)}-url`"
                input-group-size="mb-3"
                type="text"
                v-model="license.license_url"
                :label="$t('message.license_url')"
              />
            </b-collapse>
          </div>

          <b-alert
            v-if="associatedLicensesError"
            variant="warning"
            show
          >
            {{ $t('condition.unsuccessful_action') }}
          </b-alert>
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-barcode"></i> {{ $t('message.hashes') }}</template
        >
        <b-input-group-form-input
          id="component-md5-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.md5"
          required="false"
          :label="$t('hashes.md5')"
          :tooltip="$t('message.component_hash_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-sha1-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.sha1"
          required="false"
          :label="$t('hashes.sha_1')"
          :tooltip="$t('message.component_hash_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-sha256-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.sha256"
          required="false"
          :label="$t('hashes.sha_256')"
          :tooltip="$t('message.component_hash_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-sha512-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.sha512"
          required="false"
          :label="$t('hashes.sha_512')"
          :tooltip="$t('message.component_hash_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-sha3256-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.sha3_256"
          required="false"
          :label="$t('hashes.sha3_256')"
          :tooltip="$t('message.component_hash_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
        <b-input-group-form-input
          id="component-sha3512-input"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="component.sha3_512"
          required="false"
          :label="$t('hashes.sha3_512')"
          :tooltip="$t('message.component_hash_desc')"
          :readonly="
            this.isNotPermitted([
              PERMISSIONS.PORTFOLIO_MANAGEMENT,
              PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
            ])
          "
        />
      </b-tab>
      <b-tab v-if="component.supplier">
        <template v-slot:title
          ><i class="fa fa-building-o"></i>
          {{ $t('message.supplier') }}</template
        >
        <b-input-group-form-input
          id="component-supplier-name-input"
          input-group-size="mb-3"
          type="text"
          v-model="component.supplier.name"
          required="false"
          readonly
          :label="$t('message.supplier_name')"
          :tooltip="this.$t('message.component_supplier_name_desc')"
        />
        <b-form-group
          id="supplierUrlsTable-Fieldset"
          :label="this.$t('message.urls')"
          label-for="supplierUrlsTable"
        >
          <bootstrap-table
            id="supplierUrlsTable"
            ref="supplierUrlsTable"
            :columns="supplierUrlsTableColumns"
            :data="component.supplier.urls"
            :options="supplierUrlsTableOptions"
          >
          </bootstrap-table>
        </b-form-group>
        <b-form-group
          id="supplierContactsTable-Fieldset"
          :label="this.$t('message.contacts')"
          label-for="contactsTable"
        >
          <bootstrap-table
            id="supplierContactsTable"
            ref="supplierContactsTable"
            :columns="supplierContactsTableColumns"
            :data="component.supplier.contacts"
            :options="supplierContactsTableOptions"
          >
          </bootstrap-table>
        </b-form-group>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-external-link"></i>
          {{ $t('message.external_references') }}</template
        >
        <bootstrap-table
          ref="referencesTable"
          :columns="referencesTableColumns"
          :data="component.externalReferences"
          :options="referencesTableOptions"
        >
        </bootstrap-table>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-file-text-o"></i> {{ $t('message.notes') }}</template
        >
        <b-form-group
          id="component-notes-form-group"
          :label="this.$t('message.notes')"
          label-for="component-notes-input"
        >
          <b-form-textarea
            id="component-notes-description"
            v-model="component.notes"
            rows="3"
            :readonly="
              this.isNotPermitted([
                PERMISSIONS.PORTFOLIO_MANAGEMENT,
                PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
              ])
            "
          />
        </b-form-group>
      </b-tab>
    </b-tabs>
    <template v-slot:footer="{ cancel }">
      <b-button
        variant="outline-danger"
        @click="deleteComponent()"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_DELETE,
        ]"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button
        variant="outline-primary"
        @click="$emit('showProperties')"
        v-permission="PERMISSIONS.VIEW_PORTFOLIO"
        >{{ $t('message.properties') }}</b-button
      >
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        variant="primary"
        @click="updateComponent()"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
        ]"
        >{{ $t('message.update') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput.vue';
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect.vue';
import permissionsMixin from '../../../mixins/permissionsMixin';
import xssFilters from 'xss-filters';
import common from '@/shared/common';
import availableClassifiersMixin from '@/mixins/availableClassifiersMixin';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'ComponentDetailsModal',
  mixins: [permissionsMixin, availableClassifiersMixin, modalMixin],
  components: {
    BInputGroupFormInput,
    BInputGroupFormSelect,
  },
  props: {
    component: Object,
  },
  emits: ['showProperties', 'componentUpdated'],
  data() {
    return {
      associatedLicenses: [],
      associatedLicensesLoading: false,
      associatedLicensesError: false,
      expandedLicenses: [],
      supplierUrlsTableColumns: [
        {
          title: this.$t('message.urls'),
          sortable: false,
          formatter(_value, row) {
            return xssFilters.inHTMLData(common.valueWithDefault(row, ''));
          },
        },
      ],
      supplierUrlsTableOptions: {
        search: false,
        showHeader: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
      supplierContactsTableColumns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.email'),
          field: 'email',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.phone'),
          field: 'phone',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      supplierContactsTableOptions: {
        search: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
      referencesTableColumns: [
        {
          title: this.$t('message.url'),
          field: 'url',
          sortable: false,
          formatter(value) {
            let url = xssFilters.uriInUnQuotedAttr(
              common.valueWithDefault(value, ''),
            );
            return `<a href="${url}">${xssFilters.inHTMLData(
              common.valueWithDefault(value, ''),
            )}</a>`;
          },
        },
        {
          title: this.$t('message.type'),
          field: 'type',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.comment'),
          field: 'comment',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      referencesTableOptions: {
        search: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
    };
  },
  beforeMount() {
    this.loadAssociatedLicenses();
  },
  beforeUpdate() {
    //console.log(this.component);
  },
  methods: {
    updateComponent: function () {
      this.visible = false;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENTS}/${this.component.uuid}`;
      let licenses = (this.associatedLicenses ?? []).map(currentLicense => {
        const expression = currentLicense.license_expression;
        const license = currentLicense.license ?? currentLicense.resolved_license?.license_id ?? currentLicense.resolvedLicense?.licenseId;
        const licenseUrl = currentLicense.license_url;
        return {
          ...(expression ? { license_expression: expression } : license ? { license } : {}),
          ...(licenseUrl ? { license_url: licenseUrl } : {}),
          acknowledgement: ['DECLARED', 'CONCLUDED'].includes(currentLicense.acknowledgement) ? currentLicense.acknowledgement : "DECLARED",
        }
      });
      this.axios
        .put(url, {
          supplier: this.component.supplier,
          name: this.component.name,
          version: this.component.version,
          group: this.component.group,
          authors: this.component.authors || [],
          publisher: this.component.publisher,
          description: this.component.description,
          licenses: licenses,
          filename: this.component.filename,
          extension: this.component.extension,
          classifier: this.component.classifier,
          purl: this.component.purl,
          cpe: this.component.cpe,
          swidTagId: this.component.swidTagId,
          copyright: this.component.copyright,
          hashes: {
            md5: this.component.md5,
            sha1: this.component.sha1,
            sha256: this.component.sha256,
            sha384: this.component.sha384,
            sha512: this.component.sha512,
            sha3_256: this.component.sha3_256,
            sha3_384: this.component.sha3_384,
            sha3_512: this.component.sha3_512,
            blake2b_256: this.component.blake2b_256,
            blake2b_384: this.component.blake2b_384,
            blake2b_512: this.component.blake2b_512,
            blake3: this.component.blake3,
            streebog_256: this.component.streebog_256,
            streebog_512: this.component.streebog_512,
          },
          notes: this.component.notes,
        })
        .then((response) => {
          this.$emit('componentUpdated', response.data);
          this.$toastr.s(this.$t('message.component_updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deleteComponent: async function () {
      this.visible = false;
      if (!(await this.$confirmDelete())) return;
      let url =
        `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/` +
        this.component.uuid;
      this.axios
        .delete(url)
        .then(() => {
          this.$toastr.s(this.$t('message.component_deleted'));
          this.$router.replace({
            path: '/projects/' + this.component.project.uuid,
          });
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    async loadAssociatedLicenses() {
      if (!this.component?.uuid || this.associatedLicensesLoading) {
        return;
      }
    
      this.expandedLicenses = [];
      this.associatedLicenses = [];
      this.associatedLicensesLoading = true;
      this.associatedLicensesError = false;
    
      const url = `${this.$api.BASE_URL}/${this.$api.URL_V2_LICENSES}/${encodeURIComponent(
        this.component.uuid,
      )}`;
    
      let pageToken;
    
      try {
        do {
          const params = {
            limit: 100,
          };
    
          if (pageToken) {
            params.page_token = pageToken;
          }
    
          const response = await this.axios.get(url, { params });
    
          this.associatedLicenses.push(...(response.data.items || []));
          pageToken = response.data.next_page_token;
        } while (pageToken);

        this.component.licenses = this.associatedLicenses;
      } catch {
        this.associatedLicensesError = true;
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      } finally {
        this.associatedLicensesLoading = false;
      }
    },
    associatedLicenseLabel(license) {
      return (
        license.resolved_license?.name ||
        license.resolved_license?.license_id ||
        license.license ||
        license.license_expression ||
        license.license_url ||
        '-'
      );
    },
    associatedLicenseKey(license) {
      return [
        license.ordinality,
        license.acknowledgement,
        this.associatedLicenseLabel(license),
      ].join(':');
    },
    licenseValue(license) {
      return (
        license.resolved_license?.license_id ||
        license.resolved_license?.name ||
        license.license ||
        ''
      );
    },
    licenseCollapseId(license) {
      return `component-license-${this.component.uuid}-${license.ordinality}`;
    },
    isLicenseExpanded(license) {
      return this.expandedLicenses.includes(
        this.associatedLicenseKey(license),
      );
    },
    toggleLicense(license) {
      const key = this.associatedLicenseKey(license);

      if (this.expandedLicenses.includes(key)) {
        this.expandedLicenses = this.expandedLicenses.filter(
          (expandedKey) => expandedKey !== key,
        );
      } else {
        this.expandedLicenses.push(key);
      }
    },
  },
};
</script>

<style scoped>
.card {
  border: 0;
  padding: 0;
  margin-bottom: 0;
}
</style>
