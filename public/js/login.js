var reg=document.getElementsByClassName('register-form')[0];
var log=document.getElementsByClassName('login-form')[0];
function register() {
	reg.style.display='block';
	log.style.display='none';
}
function logIn() {
	log.style.display='block';
	reg.style.display='none';
}
