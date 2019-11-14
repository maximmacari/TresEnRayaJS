//Se define una clase Tools que es la encargada de hacer las peticiones desde el lado cliente
class Tools {
  constructor() {

  }

  httpDataParse(arr) {
    var data = "";

    for (let i = 0; i < arr.length; i++) {
      let key = arr[i];

      if (i !== 0) {
        data += "&" + key.name + "=" + key.value;
      } else {
        data += key.name + "=" + key.value;
      }
    }

    return encodeURI(data);
  }

  //Función encargada de las peticiones get
  httpGet(url, cbSuccess, cbError) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status == 200) {
          cbSuccess(xhr.responseText);
        } else if (xhr.status >= 500) {
          cbError(xhr.status);
        } else if (xhr.status >= 402 && xhr.status <= 420) {
          cbError(xhr.status);
        } else if (xhr.status == 400 || xhr.status == 401) {
          cbError(xhr.status);
        }
      }
    };

    xhr.onerror = function (err) {
      cbError(err);
    }

    xhr.onabort = function (err) {
      cbError(err);
    }

    xhr.open('GET', url);
    try {
      xhr.send();
    } catch (err) {
      cbError(err);
    }
  }
  //Método para las peticiones post
  httpPost(url, data, cbSuccess, cbError) {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status == 200) {
          cbSuccess(xhr.responseText);
        } else if (xhr.status >= 500) {
          cbError(xhr.status);
        } else if (xhr.status >= 402 && xhr.status <= 420) {
          cbError(xhr.status);
        } else if (xhr.status == 400 || xhr.status == 401) {
          cbError(xhr.status);
        }
      }
    };

    xhr.onerror = function (err) {
      cbError(err);
    }

    xhr.onabort = function (err) {
      cbError(err);
    }

    try {
      xhr.send(data);
    } catch (err) {
      cbError(err);
    }
  }

  checkConnection() {
    var networkState = navigator.connection.type;

    return networkState;
  }
  //Función encargada de mostrar el alert
  showModal(title, msg, cbOk) {
    let modalHtml = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4>${title}</h4>
        </div>
        <div class="modal-body">
          <p>${msg}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary control-ok">Ok</button>
        </div>
      </div>
    </div>
    `.trim();

    let modal = document.getElementById("modalTemplate");
    modal.innerHTML = modalHtml;

    document.body.appendChild(modal);

    $(modal).modal();
    $(modal).modal('show');

    if(cbOk){
      modal.getElementsByClassName("control-ok")[0]
      .addEventListener("click", cbOk, true);
    }else{
      modal.getElementsByClassName("control-ok")[0]
      .addEventListener("click", () => {
        $(modal).modal('hide').data('bs.modal', null); 
      }, true);
    }

    return modal;
  }
}
