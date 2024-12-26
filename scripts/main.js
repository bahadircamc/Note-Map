import { personIcon, homeIcon, jobIcon, gotoIcon, parkIcon } from "./constants.js";
import ui from "./ui.js";
import getIcon, { getStatus } from "./helpers.js";

//* Global degiskenler

// haritada tiklanan son konum
let map;
let clickedCoords;
let layer;
let notes = JSON.parse(localStorage.getItem("notes")) || [];//JSON.parsee ile string olan veriyi js dizin cevirir.


/*
* Kullanicinin konumu ogrenmek icin getCurrentPosition: kullanicaz.Kullanicidan konumu paylasmasini isteyecegiz.
*1) kullanici kabul ederse haritayi kulanicinin konumuna gore ayarlayacagiz
* 2) eger kabul etmezse haritayi Ankara'ya ayarlayacagiz
*/

window.navigator.geolocation.getCurrentPosition(
    (e) => {

        //kullanican alinan konum
        loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
    },
    () => {

        //ankaranin konumu
        loadMap([39.925951, 32.862993], "Varsayilan Konum");
    })

//*haritayi yukler
function loadMap(currentPosition, msg) {

    //1) harita kurulum / merkez belirleme
    map = L.map('map', {
        zoomControl: false,
    })
    .setView(currentPosition, 8);

    // sag assagi zoom butonlari ekle
    L.control
    .zoom({
        position: "bottomright",
    })
    .addTo(map);

    //2) Haritayi ekrana basar
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //haritanin uzerine imlecleri ekleycegimiz bir katman olustur.
    layer = L.layerGroup().addTo(map);

    //3) imclec ekle
    var marker = L.marker(currentPosition, { icon: personIcon })
        .addTo(map)
        .bindPopup(msg);

    // 4) haritada tiklanma olaylarini izleyelim
    map.on("click", onMapClick);

    // 5) ekrana daha once eklenen notlari bas
    renderNotes();
    renderMarkers();
}


//* haritaya tiklanma olayinda calisacak fonksiyon
function onMapClick(e) {

    //tiklanma konumun kordinatlarini global degiskene aktar
    clickedCoords = [e.latlng.lat, e.latlng.lng]; 33

    //aside elementine add class'ini ekle.
    ui.aside.className = "add";
}

//* iptal butonuna tiklaninca form'u kapat
ui.cancelBtn.addEventListener("click", () => {

    //aside elementinden add class'ini kaldir
    ui.aside.className = "";
});

//*Form gonderilince:
ui.form.addEventListener("submit", (e) => {

    //sayfa yenilenmesini engeller
    e.preventDefault()

    //inputlardaki verilere eris
    const title = e.target[0].value;
    const date = e.target[1].value;
    const status = e.target[2].value;

    //yeni bir nesne olustur.
    const newNote = {
        id: new Date().getTime(),
        title,
        date,
        status,
        coords: clickedCoords,
    };

    //nesneyi global degiskene kaydet.--unshift ile eklenen eleman dizinin basina gelir.
    notes.unshift(newNote);

    //localstorage'i guncelle.--JSON.stringify yöntemi, JavaScript nesnesini veya dizisini bir JSON stringine dönüştürür. Bu,
    localStorage.setItem("notes", JSON.stringify(notes));

    // aside alanindan add class'ini kaldir.
    ui.aside.className = "";

    //formu temizleme
    e.target.reset();

    //yeeni notun ekrana gelmesi icin notlari tekrardan renderla
    renderNotes();
    renderMarkers();


});

//* ekrana imlecleri bas
function renderMarkers() {
    //eski imlecleri kaldir(katmandaki markerleri temizle)
    layer.clearLayers();
    notes.forEach((item) => {
        //item in statusunee bagli iconu belirle
        const icon = getIcon(item.status);

        L.marker(item.coords, { icon }) //imleci olustur,
            .addTo(layer) //imlecleri katmana ekle,
            .bindPopup(item.title); //imlecin title'ini popup olarak ekle.
    });
}

//* ekrana notlari bas
function renderNotes() {
    const noteCards = notes
        .map((item) => {
            //tarihi kullanci dostu formata cevirdik 
            const date = new Date(item.date).toLocaleString("tr", {
                day: "2-digit",
                month: "long",
                year: "2-digit",
            })

            //status degerini cevir
            const status = getStatus(item.status);

            //olusturulucak note'un html icerigini belirle
            return `
           <li>
            <div>
              <p>${item.title}</p>

              
              <p>${date}</p>
              <p>${status}</p>
            </div>
            <div class="icons">
              <i data-id="${item.id}" class="bi bi-airplane-fill" id="fly"></i>
              <i data-id="${item.id}" class="bi bi-trash3-fill" id="delete"></i>
            </div>
          </li>
    `;
        })
        .join("");

    //note'lari liste alaninda renderla
    ui.list.innerHTML = noteCards;

    //ekrandaki delete id'li iconlari al ve tiklanma olaylarinda silme fonksiyonu calistir.
    document.querySelectorAll("li #delete").forEach((btn) => {
        btn.addEventListener(("click"), () => deleteNote(btn.dataset.id));
    });

    //ekrandaki fly id'li iconlari al ve tiklanma ucus fonksiyonu calistir.
    document.querySelectorAll("li #fly").forEach((btn) => {
        btn.addEventListener(("click"), () => flyToLocation(btn.dataset.id));
    });
}

//*silme butonuna tiklaninca
function deleteNote(id) {

    const res = confirm("Notu silmeyi onayliyor musunuz ?");

    //onaylarsa sil
    if (res) {

        //id'sini bildigimiz elemani kaldirmamiz gerekiyor filter methodu ile.
        notes = notes.filter((note) => note.id !== +id);

        //localstorage guncelle
        localStorage.setItem("notes", JSON.stringify(notes));

        //guncel ntlari ekrana bas 
        renderNotes();

        //guncel imlecleri ekrana bas
        renderMarkers();
    }
}

//* ucus butonuna tiklaninca
function flyToLocation(id) {
    
    
    //id'si bilinen elemani dizide bul
    const note = notes.find((note) => note.id === +id);

    //note'un koordinatlarina uc
    map.flyTo(note.coords,12); 
}

//*tiklanma olayinda:
//aside alnindaki form veya liste icerigini gizlemek icin hide class'i ekle
ui.arrow.addEventListener("click", () => {
    ui.aside.classList.toggle("hide");
});