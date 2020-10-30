var map;
var infoWindow;
var markers = [];
var array = [];
const los = { lat: 34.06338, lng: -118.35808 };
const cityzip = {
  90048: {
    center: { lat: 34.0742, lng: -118.3725 },
  },
  90036: {
    center: { lat: 34.0665, lng: -118.352 },
  },
  90211: {
    center: { lat: 34.0661, lng: -118.3842 },
  },
  90035: {
    center: { lat: 34.0508, lng: -118.3842 },
  },
  90069: {
    center: { lat: 34.0932, lng: -118.3783 },
  },
  90019: {
    center: { lat: 34.0489, lng: -118.3404 },
  },
  90046: {
    center: { lat: 34.1147, lng: -118.3637 },
  },
  90210: {
    center: { lat: 34.103, lng: -118.4105 },
  },
  90038: {
    center: { lat: 34.0895, lng: -118.3316 },
  },
};
var zipCode;

var coord = {};

function initMap() {
  let los = { lat: 34.06338, lng: -118.35808 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: los,
    zoom: 11,
  });
  infoWindow = new google.maps.InfoWindow();
}
const onEnter = (e) => {
  if (e.key == "Enter") {
    getCoord();
    getStores();
  }
};
const getStores = () => {
  zipCode = document.getElementById("zip-code").value;

  if (!zipCode) {
    return;
  }

  const API_URL = "http://localhost:3000/api/stores";
  const fullUrl = `${API_URL}?zip_code=${zipCode}`;
  fetch(fullUrl)
    .then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then((data) => {
      if (data.length > 0) {
        clearLocations();
        searchLocationsNear(data);
        setStoresList(data);
        setOnClickListener();
        setOnClickListener2();
      } else {
        clearLocations();
        noStoresFound();
      }
    });
};
const getCoord = () => {
  zipCode = document.getElementById("zip-code").value;

  if (!zipCode) {
    return;
  }
  console.log(zipCode);
  for (var zip in cityzip) {
    if (zip === zipCode) {
      let zip1 = parseInt(zip, 10);
      coord = cityzip[zip1].center;
    }
  }
};
const clearLocations = () => {
  infoWindow.close();
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
};
const noStoresFound = () => {
  const html = `
  <div class="no-stores-found">
      No Stores Found
  </div>
  `;
  document.querySelector(".stores-list").innerHTML = html;
};
function setOnClickListener() {
  var storeElements = document.querySelectorAll(".store-container");
  storeElements.forEach((elem, index) => {
    elem.addEventListener("click", function () {
      new google.maps.event.trigger(markers[index], "click");
    });
  });
}

const setStoresList = (stores) => {
  let storesHtml = "";
  stores.map((store, index) => {
    storesHtml += `
      <div class="store-container">
          <div class="store-container-background">
              <div class="store-info-container">
                  <div class="store-address">
                      <span>${store.addressLines[0]}</span>
                      <span>${store.addressLines[1]}</span>
                  </div>
                  <div class="store-phone-number">${store.phoneNumber}</div>
              </div>
              <div class="store-number-container">
                  <div class="store-number">
                      ${index + 1}
                  </div>
              </div>
          </div>
      </div>
      `;
  });
  document.querySelector(".stores-list").innerHTML = storesHtml;
};
const setPointList = (hull) => {
  let storesHtml = "";
  hull.map((point) => {
    storesHtml += `
      <div class="store-container">
          <div class="store-container-background">
              <div class="store-info-container">
                  <div class="store-address">
                      <span>Latitude: ${point[0]}</span>
                      <span>Longitude: ${point[1]}</span>
                  </div>
                  
              </div>
              <div class="store-number-container">
                  <div class="store-number">
                      ${point[2]}
                  </div>
              </div>
          </div>
      </div>
      `;
  });
  document.querySelector(".stores-list-2").innerHTML = storesHtml;
};
const searchLocationsNear = (stores) => {
  let bounds = new google.maps.LatLngBounds();
  stores.forEach((store, index) => {
    let latlng = new google.maps.LatLng(
      store.location.coordinates[1],
      store.location.coordinates[0]
    );
    let arr = [];
    arr.push(store.location.coordinates[1]);
    arr.push(store.location.coordinates[0]);
    arr.push(index + 1);

    array.push(arr);

    let name = store.storeName;
    let address = store.addressLines[0];
    let openStatusText = store.openStatusText;
    let phone = store.phoneNumber;
    bounds.extend(latlng);
    createMarker(latlng, name, address, openStatusText, phone, index + 1);
  });
  map.fitBounds(bounds);
  drawCircle();
  convexHull(array);
};
function drawCircle() {
  const cityCircle = new google.maps.Circle({
    strokeColor: "#0C2B40",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#0C2B40",
    fillOpacity: 0.35,
    map,
    center: coord,
    radius: 3000,
  });
}

const createMarker = (
  latlng,
  name,
  address,
  openStatusText,
  phone,
  storeNumber
) => {
  const html = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-open-status">
                 
            </div>
            <div class="store-info-address">
                <div class="icon">
                    <i class="fas fa-location-arrow"></i>
                </div>
                <span>
                   ${address}
                </span>
            </div>
            <div class="store-info-phone">
                <div class="icon">
                    <i class="fas fa-phone-alt"></i>
                </div>
                <span><a href="tel:${phone}">${phone}</a></a></span>
            </div>
        </div>
    `;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: "Hello World!",
    label: `${storeNumber}`,
  });
  google.maps.event.addListener(marker, "click", function () {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
  markers.push(marker);
};

//Convex Hull

var orientation1 = (p, q, r) => {
  let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);

  if (val === 0) {
    return 0;
  }
  return val > 0 ? 1 : 2;
};
var convexHull = (array) => {
  console.log("Hello");
  let n = array.length;

  if (n < 3) return;

  var hull = [];

  let l = 0;
  for (let i = 1; i < n; i++) {
    if (array[i][0] < array[l][0]) {
      l = i;
    }
  }

  let p = l;
  let q;

  do {
    hull.push(array[p]);

    q = (p + 1) % n;
    for (let i = 0; i < n; i++) {
      if (orientation1(array[p], array[i], array[q]) == 2) {
        q = i;
      }
    }

    p = q;
  } while (p != l);

  setPointList(hull);
  area(hull, hull.length);

  for (let i = 0; i < hull.length; i++) {
    console.log(`index ${hull[i][2]} lat ${hull[i][0]} lng ${hull[i][1]}`);
  }
};

function area(hull, n) {
  var ar = 0.0;
  var j = n - 1;
  for (var i = 0; i < n; i++) {
    ar += (hull[j][0] + hull[i][0]) * (hull[j][1] - hull[i][1]);
    j = i;
  }
  const htmls = `<div> Convex Hull Area: ${(
    Math.abs(ar / 2.0) *
    111.045 *
    111.045
  ).toFixed(2)} km<sup>2</sup></div>`;
  document.getElementById("area").innerHTML = htmls;
}
