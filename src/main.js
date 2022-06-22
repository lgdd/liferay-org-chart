import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

class LiferayOrgChartElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div id="liferayOrgChart"></div>';
    
    new Vue({
      data: {
        message: 'Hello'
      },
      render: h => h(App),
    }).$mount('#liferayOrgChart')
  }
}

if (customElements.get('liferay-org-chart')) {
  console.log('Skipping registration for <liferay-org-chart> (already registered)');
} else {
  customElements.define('liferay-org-chart', LiferayOrgChartElement);
}
