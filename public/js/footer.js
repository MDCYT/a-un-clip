// Detect the %%YEAR%% placeholder and replace it with the current year
var year = new Date().getFullYear();
var footer = document.getElementsByClassName('text-year')[0];
if (footer) {
    footer.innerHTML = footer.innerHTML.replace('%%YEAR%%', year);
}