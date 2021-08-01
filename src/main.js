import axios from 'axios';

const API_BASE_URL = 'https://todo-app-csoc.herokuapp.com/';

const Login = document.getElementById('login')
if (Login != null) Login.addEventListener('click', login);

const reg = document.getElementById('register');
if (reg != null) reg.addEventListener('click', register);

const Logout = document.getElementById('logout');
if (Logout != null) Logout.addEventListener('click', logout);

const addtask = document.getElementById('Taskadd');
if (addtask != null) addtask.addEventListener('click', addTask);

function displaySuccessToast(message) {
    iziToast.success({
        title: 'Success',
        message: message
    });
}

function displayErrorToast(message) {
    iziToast.error({
        title: 'Error',
        message: message
    });
}

function displayInfoToast(message) {
    iziToast.info({
        title: 'Info',
        message: message
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.replace('../login/index.html');
    displaySuccessToast('Succesfully Logged Out!')
}

function registerFieldsAreValid(firstName, lastName, email, username, password) {
    if (firstName === '' || lastName === '' || email === '' || username === '' || password === '') {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        displayErrorToast("Please enter a valid email address.")
        return false;
    }
    return true;
}

function register() {
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (registerFieldsAreValid(firstName, lastName, email, username, password)) {
        displayInfoToast("Please wait...");

        const dataForApiRequest = {
            name: firstName + " " + lastName,
            email: email,
            username: username,
            password: password
        }

        axios({
            url: API_BASE_URL + 'auth/register/',
            method: 'post',
            data: dataForApiRequest,
        }).then(function ({
            data,
            status
        }) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
            getTasks();
            displaySuccessToast('You Are Succesfully Registered And Logged In.');
        }).catch((err) => displayErrorToast('An account using same email or username is already created'))
        
    }
}

function login() {
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;
    displayInfoToast("Please wait...");
    const dataForApiRequest = {
        username: username,
        password: password
    }
    axios({
        url: API_BASE_URL + 'auth/login/',
        method: 'post',
        data: dataForApiRequest,
    }).then(function ({
        data,
        status
    }) {
        localStorage.setItem('token', data.token);
        window.location.href = '/';
        displaySuccessToast('You are Logged In.');
        getTasks();
    }).catch((err) => displayErrorToast('Invalid Credentials'))
   
}


function addTask() {
    const inserttask = document.getElementById("inserttask");
    let insertData = inserttask.value;
    axios({
        headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
        },
        method: 'post',
        url: API_BASE_URL + 'todo/create/',
        data: {
            title: insertData
        }
    }).then(function ({
        data,
        status
    }) {
        getTasks();
        displaySuccessToast("New Task Added");
        inserttask.value = '';
    }).catch((err) => displayErrorToast('Todo Item Cannot Be Added'))
}

function editTask(id) {
    document.getElementById('task-' + String(id)).classList.add('hideme');
    document.getElementById('task-actions-' + String(id)).classList.add('hideme');
    document.getElementById('input-button-' + String(id)).classList.remove('hideme');
    document.getElementById('done-button-' + String(id)).classList.remove('hideme');

}

function deleteTask(id) {

    var arr = [],
        iD = 0;
    axios({
        headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
        },
        url: API_BASE_URL + 'todo/',
        method: 'get',
    }).then(function ({
        data,
        status
    }) {
        arr = data;
        iD = arr[id - 1].id;
        const address = API_BASE_URL + 'todo/' + String(iD) + '/';
        axios({
            headers: {
                Authorization: 'Token ' + localStorage.getItem('token'),
            },
            method: 'delete',
            url: address,
        }).then(function ({
            data,
            status
        }) {
            getTasks();
            displaySuccessToast("Task Deleted");
        }).catch((err) => displayErrorToast('Error In Deletion ! !'))
    })


}

function updateTask(id) {
    const insertData = document.getElementById(`input-button-${id}`).value;

    if (insertData != '') {
        axios({
            headers: {
                Authorization: 'Token ' + localStorage.getItem('token'),
            },
            url: API_BASE_URL + 'todo/',
            method: 'get',
        }).then(function ({
            data,
            status
        }) {
            const ID = data[id - 1].id;

            const address = API_BASE_URL + 'todo/' + (ID) + '/';
            console.log(address);
            axios({
                headers: {
                    Authorization: 'Token ' + localStorage.getItem('token'),
                },
                method: 'patch',
                url: address,
                data: {
                    title: insertData
                }
            }).then(function ({
                data,
                status
            }) {
                getTasks();
                displaySuccessToast("Task Updated");
            }).catch((err) => displayErrorToast('Error In Updating ! !'))
        })
    } else displayErrorToast('Task Name Cannot Be Empty');

    document.getElementById('task-' + String(id)).classList.remove('hideme');
    document.getElementById('task-actions-' + String(id)).classList.remove('hideme');
    document.getElementById('input-button-' + String(id)).classList.add('hideme');
    document.getElementById('done-button-' + String(id)).classList.add('hideme');

}

export default function getTasks() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    var arr = [];
    axios({
        headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
        },
        url: API_BASE_URL + 'todo/',
        method: 'get',
    }).then(function ({
        data,
        status
    }) {
        arr = data;

        for (var i = 1; i <= data.length; i++) {
            list.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <input id="input-button-${i}" type="text" class="form-control todo-edit-task-input hideme" placeholder="Edit The Task">
                    <div id="done-button-${i}"  class="input-group-append hideme">
                        <button class="btn btn-outline-secondary todo-update-task" type="button" id="updatetasks-${i}">Done</button>
                    </div>
                    <div id="task-${i}" class="todo-task">
                    ${arr[i - 1].title}
                    </div>

                    <span id="task-actions-${i}">
                        <button style="margin-right:5px;" type="button" id="edittask-${i}"
                            class="btn btn-outline-warning">
                            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486663/CSOC/edit.png"
                                width="18px" height="20px">
                        </button>
                        <button type="button" class="btn btn-outline-danger" id="deletetask-${i}">
                            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486661/CSOC/delete.svg"
                                width="18px" height="22px">
                        </button>
                    </span>
            </li>`
        }

        for (let index = 1; index <= arr.length; index++) {


            document.getElementById(`edittask-${index}`).addEventListener('click', function () {
                editTask(index);
            });
            document.getElementById(`updatetasks-${index}`).addEventListener('click', function () {
                updateTask(index);
            });
            document.getElementById(`deletetask-${index}`).addEventListener('click', function () {
                deleteTask(index);
            });

        }
    })

}