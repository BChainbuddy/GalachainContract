// health check
const currentUrl = window.location.origin;
const components = currentUrl.split(':');
const baseUrl = `${components[0]}:${components[1]}`;
const graphql = `${baseUrl}:3010/graphiql`;
const explorer = `${baseUrl}:3010/blocks`;

function ping(url, id, args = []) {
	fetch(url, ...args)
		.then((res) => {
			document.getElementById(id).textContent =
				res.ok || res.status === 200 ? 'Online' : 'Offline';
		})
		.catch((err) => {
			console.error(err);
			document.getElementById(id).textContent = 'Offline';
		});
}

function checkConnections() {
	ping(currentUrl, 'apiStatus');
	// doesn't work due to CORS
	// ping(graphql, 'galachainApiStatus', [
	// 	{
	// 		method: 'POST',
	// 		headers: { Authorization: null },
	// 		body: { query: '{allTransactions{totalCount}}' },
	// 	},
	// ]);
	ping(explorer, 'galachainStatus');
}

setInterval(checkConnections, 3000);

// Initialization
function init() {
	// document.getElementById('currentUrl').textContent = window.location.href;
	document
		.querySelectorAll('.apiBaseUrl')
		.forEach((element) => (element.textContent = currentUrl));

	document.getElementById('blockExplorerLink').href = explorer;
	document.getElementById('graphqlLink').href = graphql;

	// Initialize the first tab as active
	document.addEventListener('DOMContentLoaded', () =>
		document.querySelector('.tablink').click()
	);
}

init();

// interaction
function copyToClipboard(element) {
	var text = document.querySelector(element);
	navigator.clipboard
		.writeText(text.textContent)
		.then(() => alert('Copied to clipboard!'))
		.catch((err) => alert('Error in copying text: ', err));
}

function openTab(event, tabName) {
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = 'none';

	tablinks = document.getElementsByClassName('tablink');
	for (i = 0; i < tablinks.length; i++)
		tablinks[i].className = tablinks[i].className.replace(' active', '');

	document.getElementById(tabName).style.display = 'block';
	event.currentTarget.className += ' active';
}
