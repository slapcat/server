import './templates.js'
import './legacy/filelistSearch.js'

import './actions/deleteAction'
import './actions/downloadAction'
import './actions/editLocallyAction'
import './actions/favoriteAction'
import './actions/openFolderAction'
import './actions/openInFilesAction.js'
import './actions/renameAction'
import './actions/sidebarAction'
import './actions/viewInFolderAction'
import './newMenu/newFolder'

import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'
import { getNavigation } from '@nextcloud/files'
import { getRequestToken } from '@nextcloud/auth'

import FilesListView from './views/FilesList.vue'
import NavigationView from './views/Navigation.vue'
import registerFavoritesView from './views/favorites'
import registerRecentView from './views/recent'
import registerFilesView from './views/files'
import registerPreviewServiceWorker from './services/ServiceWorker.js'
import router from './router/router'
import RouterService from './services/RouterService'
import SettingsModel from './models/Setting.js'
import SettingsService from './services/Settings.js'

// @ts-expect-error __webpack_nonce__ is injected by webpack
__webpack_nonce__ = btoa(getRequestToken())

declare global {
	interface Window {
		OC: any;
		OCA: any;
		OCP: any;
	}
}

// Init private and public Files namespace
window.OCA.Files = window.OCA.Files ?? {}
window.OCP.Files = window.OCP.Files ?? {}

// Expose router
const Router = new RouterService(router)
Object.assign(window.OCP.Files, { Router })

// Init Pinia store
Vue.use(PiniaVuePlugin)
const pinia = createPinia()

// Init Navigation Service
const Navigation = getNavigation()
Vue.prototype.$navigation = Navigation

// Init Files App Settings Service
const Settings = new SettingsService()
Object.assign(window.OCA.Files, { Settings })
Object.assign(window.OCA.Files.Settings, { Setting: SettingsModel })

// Init Navigation View
const View = Vue.extend(NavigationView)
const FilesNavigationRoot = new View({
	name: 'FilesNavigationRoot',
	propsData: {
		Navigation,
	},
	router,
	pinia,
})
FilesNavigationRoot.$mount('#app-navigation-files')

// Init content list view
const ListView = Vue.extend(FilesListView)
const FilesList = new ListView({
	name: 'FilesListRoot',
	router,
	pinia,
})
FilesList.$mount('#app-content-vue')

// Init legacy and new files views
registerFavoritesView()
registerFilesView()
registerRecentView()

// Register preview service worker
registerPreviewServiceWorker()
