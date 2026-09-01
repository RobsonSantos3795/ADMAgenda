import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { 
      getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot 
    } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    // SUBSTÍTUAS PELAS SUAS CONFIGURAÇÕES DO FIREBASE
    const firebaseConfig = {
    apiKey: "AIzaSyCTu9PW3f3zpgF2LhN6ehc4sniMYLVIt2k",
    authDomain: "armagenando-imagem.firebaseapp.com",
    projectId: "armagenando-imagem",
    storageBucket: "armagenando-imagem.firebasestorage.app",
    messagingSenderId: "996443819658",
    appId: "1:996443819658:web:ecfdd0e4953c837b92e773"
  };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const contactsCollection = collection(db, "contatos");

    let allContacts = [];

    // Adiciona novo campo de input de telefone no formulário
    window.addPhoneInputField = function(value = "") {
      const container = document.getElementById("phone-inputs-container");
      const div = document.createElement("div");
      div.className = "phone-input-group";
      div.innerHTML = `
        <input type="text" class="phone-input" placeholder="Ex: (11) 99999-9999" value="${value}">
        <button type="button" class="btn-danger" onclick="removePhoneInput(this)">X</button>
      `;
      container.appendChild(div);
    };

    // Remove um campo de input de telefone
    window.removePhoneInput = function(btn) {
      const container = document.getElementById("phone-inputs-container");
      if (container.children.length > 1) {
        btn.parentElement.remove();
      } else {
        alert("O contato precisa ter pelo menos um campo de telefone.");
      }
    };

    // Reseta o formulário
    window.resetForm = function() {
      document.getElementById("contact-id").value = "";
      document.getElementById("contact-name").value = "";
      document.getElementById("phone-inputs-container").innerHTML = "";
      addPhoneInputField();
      document.getElementById("save-btn").innerText = "Salvar Contato";
      document.getElementById("cancel-btn").style.display = "none";
    };

    // Salvar ou Atualizar Contato
    window.saveContact = async function() {
      const id = document.getElementById("contact-id").value;
      const name = document.getElementById("contact-name").value.trim();
      const phoneInputs = document.querySelectorAll(".phone-input");
      
      const phones = Array.from(phoneInputs)
        .map(input => input.value.trim())
        .filter(val => val !== "");

      if (!name) {
        alert("Por favor, preencha o nome.");
        return;
      }
      if (phones.length === 0) {
        alert("Adicione pelo menos um telefone válido.");
        return;
      }

      try {
        if (id) {
          // Atualizar
          const docRef = doc(db, "contatos", id);
          await updateDoc(docRef, { name, phones });
        } else {
          // Criar novo
          await addDoc(contactsCollection, { name, phones });
        }
        resetForm();
      } catch (error) {
        console.error("Erro ao salvar contato: ", error);
      }
    };

    // Apagar Contato Inteiro
    window.deleteContact = async function(id) {
      if (confirm("Tem certeza que deseja apagar este contato?")) {
        await deleteDoc(doc(doc(db, "contatos", id)));
      }
    };

    // Preparar formulário para Editar Contato
    window.editContact = function(id) {
      const contact = allContacts.find(c => c.id === id);
      if (!contact) return;

      document.getElementById("contact-id").value = contact.id;
      document.getElementById("contact-name").value = contact.name;
      
      const container = document.getElementById("phone-inputs-container");
      container.innerHTML = "";
      
      contact.phones.forEach(phone => addPhoneInputField(phone));

      document.getElementById("save-btn").innerText = "Atualizar Contato";
      document.getElementById("cancel-btn").style.display = "inline-block";
    };

    // Renderizar Lista na Tela
    function renderContacts(contacts) {
      const listContainer = document.getElementById("contacts-list");
      listContainer.innerHTML = "";

      if (contacts.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">Nenhum contato encontrado.</p>';
        return;
      }

      contacts.forEach(contact => {
        const card = document.createElement("div");
        card.className = "contact-card";

        const phonesHTML = contact.phones.map(p => `<span class="phone-tag">📞 ${p}</span>`).join("");

        card.innerHTML = `
          <div class="contact-info">
            <h3>${contact.name}</h3>
            <div>${phonesHTML}</div>
          </div>
          <div class="contact-actions">
            <button class="btn-secondary" onclick="editContact('${contact.id}')">Editar</button>
            <button class="btn-danger" onclick="deleteContact('${contact.id}')">Apagar</button>
          </div>
        `;
        listContainer.appendChild(card);
      });
    }

    // Filtrar em tempo real (Busca Rápida)
    window.filterContacts = function() {
      const query = document.getElementById("search-input").value.toLowerCase();
      const filtered = allContacts.filter(c => c.name.toLowerCase().includes(query));
      renderContacts(filtered);
    };

    // Escutar alterações do Firebase em tempo real
    onSnapshot(contactsCollection, (snapshot) => {
      allContacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      filterContacts(); // Renderiza aplicando qualquer filtro ativo
    });