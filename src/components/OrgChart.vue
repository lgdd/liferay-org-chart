<template>
  <div>
    <div v-if="ds == null && !error">
      <span aria-hidden="true" class="loading-animation"></span>
    </div>
    <div v-else-if="error">
      <div class="alert alert-danger" role="alert">
        <span class="alert-indicator"></span>
        {{ errorMessage }}
      </div>
    </div>
    <div v-else>
      <organization-chart
        :datasource="ds"
        :pan="options.pan"
        :zoom="options.zoom"
        :zoomin-limit="options.zoomin_limmit"
        :zoomout-limit="options.zoomout_limit"
      ></organization-chart>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import OrganizationChart from "vue-organization-chart";
import "./OrgChart.css";

export default {
  components: {
    OrganizationChart,
  },
  data() {
    return {
      ds: null,
      options: {
        pan: process.env.VUE_APP_ORG_CHART_OPTS_PAN == "true",
        zoom: process.env.VUE_APP_ORG_CHART_OPTS_ZOOM == "true",
        zoomin_limmit: parseFloat(
          process.env.VUE_APP_ORG_CHART_OPTS_ZOOMIN_LIMIT
        ),
        zoomout_limit: parseFloat(
          process.env.VUE_APP_ORG_CHART_OPTS_ZOOMOUT_LIMIT
        ),
      },
      error: false,
      errorMessage: null,
    };
  },
  async mounted() {
    const host = process.env.VUE_APP_LIFERAY_HOST;
    const username = process.env.VUE_APP_LIFERAY_USERNAME;
    const password = process.env.VUE_APP_LIFERAY_PASSWORD;
    const organizations = [];

    const response = await axios({
      method: "GET",
      url: `${host}/o/headless-admin-user/v1.0/organizations`,
      auth: {
        username: username,
        password: password,
      },
    });

    for (const org of response.data.items) {
      const { id, name } = org;
      const children = [];
      const users = await this.getChildrenUsers(org);
      const subOrgs = await this.getChildrenOrgs(org);

      subOrgs.forEach((subOrg) => {
        children.push(subOrg);
      });

      users.forEach((user) => {
        children.push(user);
      });

      organizations.push({
        id: id,
        name: name,
        children: children,
      });
    }

    this.ds = {
      id: "1",
      name: "Company",
      children: organizations,
    };
  },
  methods: {
    async getChildrenUsers(parentOrg) {
      const host = process.env.VUE_APP_LIFERAY_HOST;
      const username = process.env.VUE_APP_LIFERAY_USERNAME;
      const password = process.env.VUE_APP_LIFERAY_PASSWORD;
      const { id } = parentOrg;
      const children = [];
      const response = await axios({
        method: "GET",
        url: `${host}/o/headless-admin-user/v1.0/organizations/${id}/user-accounts`,
        auth: {
          username: username,
          password: password,
        },
      });
      for (const user of response.data.items) {
        const { id, name, jobTitle } = user;

        const isNotExcluded = await this.isNotExcluded(name);

        if (isNotExcluded) {
          children.push({
            id: id,
            name: name,
            title: jobTitle,
          });
        }
      }
      return children;
    },
    async getChildrenOrgs(parentOrg) {
      const host = process.env.VUE_APP_LIFERAY_HOST;
      const username = process.env.VUE_APP_LIFERAY_USERNAME;
      const password = process.env.VUE_APP_LIFERAY_PASSWORD;
      const { id } = parentOrg;
      const children = [];
      const response = await axios({
        method: "GET",
        url: `${host}/o/headless-admin-user/v1.0/organizations/${id}/organizations`,
        auth: {
          username: username,
          password: password,
        },
      });
      for (const org of response.data.items) {
        const { id, name, numberOfOrganizations } = org;
        const subChildren = [];

        const isNotExcluded = await this.isNotExcluded(name);

        if (isNotExcluded) {
          if (numberOfOrganizations > 0) {
            let subOrgs = await this.getChildrenOrgs(org);
            subChildren.concat(subOrgs);
            subOrgs.forEach((subOrg) => {
              subChildren.push(subOrg);
            });
          }

          let users = await this.getChildrenUsers(org);
          users.forEach((user) => {
            subChildren.push(user);
          });

          children.push({
            id: id,
            name: name,
            children: subChildren,
          });
        }
      }

      return children;
    },
    async isNotExcluded(fullName) {
      const names = fullName.toLowerCase().split(" ");
      const excludedNames = process.env.VUE_APP_LIFERAY_EXCLUDED_NAMES.split(
        ","
      );

      return !names.some((name) => excludedNames.includes(name));
    },
  },
};
</script>
