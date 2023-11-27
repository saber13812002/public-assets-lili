var token = document.getElementById("token").value;

if (token) {
    localStorage.setItem('token', token);
    console.log(token);
    console.log("token added tp localstorage");
} else {
    console.log("token not found");
}
