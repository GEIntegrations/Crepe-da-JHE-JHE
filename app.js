/* ==========================================================
   THE CREPE GOURMET — lógica do cardápio e dos pedidos
   Edite os dados do objeto CONFIG para atualizar a loja.
   ========================================================== */

// Configurações principais da loja.
const CONFIG = {
  whatsapp: "5561996783648", // Número identificado no cardápio: (61) 99678-3648
  packagingPrice: 2.00,
  address: "QNN 35 Conjunto A, Casa 36 - Ceilândia/DF"
};

// Catálogo transcrito dos dois cardápios enviados.
// Os preços são os que aparecem nas imagens. Descrições podem ser ajustadas pela loja.
const products = [
  {id:"trad-napolitano",name:"Napolitano",group:"tradicional",type:"salgado",price:14.99,icon:"🍅",description:"Presunto, mussarela, tomate, cebola, orégano, azeitona, milho e cheddar ou catupiry."},
  {id:"trad-frango",name:"Frango",group:"tradicional",type:"salgado",price:14.99,icon:"🍗",description:"Frango, mussarela, milho, cebola, orégano, azeitona e cheddar ou catupiry."},
  {id:"trad-calabresa",name:"Calabresa",group:"tradicional",type:"salgado",price:14.99,icon:"🌶️",description:"Calabresa, mussarela, milho, cebola, azeitona, orégano, batata palha e catupiry ou cheddar."},
  {id:"doce-chocolate",name:"Chocolate",group:"tradicional",type:"doce",price:14.99,icon:"🍫",description:"Mussarela, chocolate e banana."},
  {id:"doce-banana",name:"Banana",group:"tradicional",type:"doce",price:14.99,icon:"🍌",description:"Mussarela, banana e canela."},
  {id:"doce-romeu",name:"Romeu e Julieta",group:"tradicional",type:"doce",price:14.99,icon:"🍓",description:"Mussarela e goiabada."},

  {id:"g-nordestino",name:"Nordestino Gourmet",group:"gourmet",type:"salgado",price:24.99,icon:"🌵",description:"Carne de sol em cubos com manteiga de garrafa, queijo coalho, cebola caramelizada, milho, azeitona, batata palha e cheddar ou catupiry."},
  {id:"g-calabresa",name:"Explosão de Calabresa",group:"gourmet",type:"salgado",price:24.99,icon:"🌶️",description:"Calabresa, mussarela, cebola caramelizada, milho, azeitona, batata palha e cheddar ou catupiry."},
  {id:"g-costela",name:"Costela Desfiada com Barbecue",group:"gourmet",type:"salgado",price:24.99,icon:"🍖",description:"Costela desfiada, mussarela, cebola caramelizada, milho, azeitona, batata palha e cheddar ou catupiry."},
  {id:"g-frango-bacon",name:"Frango Cremoso com Bacon",group:"gourmet",type:"salgado",price:24.99,icon:"🥓",description:"Frango cremoso, mussarela, bacon crocante, cebola caramelizada, azeitona, batata palha e cheddar ou catupiry."},
  {id:"g-raiz",name:"Sabor Raiz",group:"gourmet",type:"salgado",price:24.99,icon:"🌶️",description:"Calabresa apimentada, mussarela, milho, tomate, cebola caramelizada, orégano, batata palha e cheddar ou catupiry."},
  {id:"g-nutella",name:"Nutella com Creme de Leite Ninho",group:"gourmet",type:"doce",price:24.99,icon:"🍫",description:"Nutella, creme de leite Ninho e morango ou banana.",choice:"Fruta",options:["Morango","Banana"]},
  {id:"g-bananella",name:"Bananella",group:"gourmet",type:"doce",price:24.99,icon:"🍌",description:"Doce de leite, banana e canela."},
  {id:"g-casadinho",name:"Casadinho",group:"gourmet",type:"doce",price:24.99,icon:"🍫",description:"Nutella, goiabada e queijo."}
];

// Ingredientes disponíveis na opção "Monte o seu" (menu tradicional).
const ingredients = ["Frango","Calabresa","Presunto","Mussarela","Milho","Tomate","Cebola","Azeitona","Orégano"];
let cart = [];
let currentFilter = "todos";
let paymentOnlineAvailable = false;

// Formata números como moeda brasileira.
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const byId = id => document.getElementById(id);

// Renderiza os cards do catálogo conforme o filtro selecionado.
function renderMenu(){
  const grid = byId("menu-grid");
  const filtered = products.filter(p => {
    if(currentFilter === "todos") return true;
    if(currentFilter === "doce" || currentFilter === "salgado") return p.type === currentFilter;
    return p.group === currentFilter;
  });
  grid.innerHTML = filtered.map(p => `
    <article class="menu-card">
      <div class="card-top"><span class="food-icon">${p.icon}</span><span class="tag">${p.group === "gourmet" ? "Gourmet" : "Tradicional"} · ${p.type}</span></div>
      <h3>${p.name}</h3><p>${p.description}</p>
      <div class="card-bottom"><span class="card-price">${money(p.price)}</span><button class="add-button" data-add="${p.id}">+ Adicionar</button></div>
    </article>`).join("");
}

// Cria as opções de ingredientes na área "Monte o seu".
function renderIngredients(){
  byId("ingredient-list").innerHTML = ingredients.map((name,index) => `
    <label class="ingredient-check"><input type="checkbox" value="${name}" ${index < 2 ? "checked" : ""}> ${name}</label>
  `).join("");
}

// Adiciona um sabor ao carrinho; sabores com escolha extra perguntam a preferência.
function addProduct(productId){
  const product = products.find(p => p.id === productId);
  if(!product) return;
  let customization = "";
  if(product.options){
    const answer = prompt("Escolha a fruta: Morango ou Banana", "Morango");
    if(answer === null) return;
    const selected = product.options.find(o => o.toLowerCase() === answer.trim().toLowerCase());
    if(!selected){ showToast("Escolha Morango ou Banana."); return; }
    customization = `Fruta: ${selected}`;
  }
  const cartKey = product.id + customization;
  const existing = cart.find(item => item.key === cartKey);
  if(existing) existing.quantity++;
  else cart.push({key:cartKey,id:product.id,name:product.name,details:customization,price:product.price,quantity:1});
  updateCart();
  showToast(`${product.name} adicionado ao pedido!`);
}

// Adiciona uma unidade personalizada "Monte o seu".
function addCustom(){
  const selected = [...document.querySelectorAll("#ingredient-list input:checked")].map(el => el.value);
  if(selected.length === 0){ showToast("Escolha pelo menos um ingrediente."); return; }
  const cheese = byId("custom-cheese").value;
  const name = "Monte o seu tradicional";
  const details = `${selected.join(", ")} + ${cheese}`;
  const key = `custom-${details}`;
  const existing = cart.find(item => item.key === key);
  if(existing) existing.quantity++;
  else cart.push({key,id:"custom",name,details,price:17.99,quantity:1});
  updateCart();
  showToast("Seu crepe personalizado foi adicionado!");
}

// Calcula valores e atualiza a sacola.
function getSubtotal(){ return cart.reduce((sum,item) => sum + item.price * item.quantity,0); }
function getPackaging(){ return byId("packaging").checked && cart.length ? CONFIG.packagingPrice : 0; }
function getTotal(){ return getSubtotal() + getPackaging(); }

function updateCart(){
  const count = cart.reduce((sum,item) => sum + item.quantity,0);
  byId("cart-count").textContent = count;
  byId("go-checkout").disabled = count === 0;
  byId("cart-items").innerHTML = cart.length ? cart.map(item => `
    <div class="cart-line">
      <div><strong>${item.name}</strong>${item.details ? `<small>${item.details}</small>` : ""}
        <div class="quantity"><button data-qty="${item.key}" data-change="-1" aria-label="Diminuir">−</button><span>${item.quantity}</span><button data-qty="${item.key}" data-change="1" aria-label="Aumentar">+</button></div>
      </div><span class="cart-line-price">${money(item.price * item.quantity)}</span>
    </div>`).join("") : `<p class="empty-cart">Sua sacola está vazia. Escolha um crepe delicioso!</p>`;
  byId("subtotal").textContent = money(getSubtotal());
  byId("packaging-value").textContent = money(getPackaging());
  byId("total").textContent = money(getTotal());
  byId("checkout-total").textContent = money(getTotal());
}

// Altera quantidade ou remove um produto quando a quantidade chega a zero.
function changeQuantity(key,delta){
  const item = cart.find(i => i.key === key);
  if(!item) return;
  item.quantity += delta;
  if(item.quantity <= 0) cart = cart.filter(i => i.key !== key);
  updateCart();
}

// Abre e fecha o carrinho lateral.
function openCart(){
  byId("cart-drawer").classList.add("open");
  byId("drawer-backdrop").classList.add("show");
  byId("cart-drawer").setAttribute("aria-hidden","false");
}
function closeCart(){
  byId("cart-drawer").classList.remove("open");
  byId("drawer-backdrop").classList.remove("show");
  byId("cart-drawer").setAttribute("aria-hidden","true");
}

// Abre a janela de finalização e mostra os campos adequados.
function openCheckout(){
  if(!cart.length) return;
  closeCart();
  byId("checkout-modal").classList.add("show");
  updateCheckoutOptions();
}
function closeCheckout(){ byId("checkout-modal").classList.remove("show"); }
function updateCheckoutOptions(){
  const delivery = byId("delivery").value;
  const payment = byId("payment").value;
  byId("address-field").classList.toggle("hidden",delivery !== "Entrega");
  byId("address-field").querySelector("input").required = delivery === "Entrega";
  byId("change-field").classList.toggle("hidden",payment !== "Dinheiro");
  byId("pay-online").classList.toggle("hidden",payment !== "Pagamento online (Mercado Pago)" || !paymentOnlineAvailable);
  byId("submit-order").classList.toggle("hidden",payment === "Pagamento online (Mercado Pago)" && paymentOnlineAvailable);
  byId("payment-note").textContent = payment === "Pix"
    ? "Ao enviar, você receberá as orientações e a chave Pix da loja pelo WhatsApp."
    : payment === "Pagamento online (Mercado Pago)"
      ? (paymentOnlineAvailable ? "Você será direcionado ao ambiente seguro do Mercado Pago." : "O pagamento online ainda não está configurado. Escolha outra forma ou fale conosco pelo WhatsApp.")
      : "Confirme o pedido pelo WhatsApp para combinar os detalhes do pagamento.";
}

// Monta o resumo legível para enviar ao WhatsApp.
function buildOrderMessage(formData){
  const lines = cart.map(item => `• ${item.quantity}x ${item.name}${item.details ? ` (${item.details})` : ""} — ${money(item.price * item.quantity)}`);
  const delivery = formData.get("delivery");
  return [
    "Olá! Gostaria de fazer um pedido no *Crepe da JHE JHE* 😋",
    "",
    "*MEU PEDIDO*",
    ...lines,
    "",
    `Subtotal: ${money(getSubtotal())}`,
    `Embalagem: ${money(getPackaging())}`,
    `*TOTAL: ${money(getTotal())}*`,
    "",
    "*DADOS DO CLIENTE*",
    `Nome: ${formData.get("name")}`,
    `Telefone: ${formData.get("phone")}`,
    `Tipo: ${delivery}`,
    ...(delivery === "Entrega" ? [`Endereço: ${formData.get("address")}`] : [`Retirada: ${CONFIG.address}`]),
    `Pagamento: ${formData.get("payment")}`,
    ...(formData.get("change") ? [`Troco para: ${formData.get("change")}`] : []),
    ...(formData.get("notes") ? [`Observações: ${formData.get("notes")}`] : []),
    "",
    "Aguardo a confirmação. Obrigado(a)!"
  ].join("\n");
}

// Envia o pedido ao WhatsApp com todos os dados preenchidos pelo cliente.
function sendToWhatsApp(formData){
  const message = buildOrderMessage(formData);
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url,"_blank","noopener,noreferrer");
  showToast("Pedido preparado! Conclua o envio na conversa do WhatsApp.");
  closeCheckout();
}

// Inicia o checkout do Mercado Pago pelo servidor, caso o token esteja configurado.
async function payOnline(formData){
  const button = byId("pay-online");
  button.disabled = true;
  button.textContent = "Preparando pagamento...";
  try{
    const response = await fetch("/api/create-preference",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        items:cart.map(item=>({title:item.name + (item.details ? ` - ${item.details}` : ""),quantity:item.quantity,unit_price:item.price})),
        customer:{name:formData.get("name")},
        orderNote:formData.get("notes") || ""
      })
    });
    const data = await response.json();
    if(!response.ok || !data.checkout_url) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
    window.location.href = data.checkout_url;
  }catch(error){
    showToast(error.message);
    button.disabled = false;
    button.textContent = "Pagar online com Mercado Pago";
  }
}

// Consulta ao servidor para saber se a loja já configurou o Mercado Pago.
async function checkPaymentSetup(){
  try{
    const response = await fetch("/api/status");
    const status = await response.json();
    paymentOnlineAvailable = Boolean(status.mercado_pago_configurado);
    const option = [...byId("payment").options].find(o=>o.value==="Pagamento online (Mercado Pago)");
    option.textContent = paymentOnlineAvailable ? "Pagamento online (Mercado Pago)" : "Pagamento online (configure a loja primeiro)";
  }catch(_error){
    paymentOnlineAvailable = false;
  }
}

// Mensagem temporária de retorno visual para o cliente.
let toastTimer;
function showToast(message){
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove("show"),2800);
}

// Liga os eventos dos botões e campos.
document.addEventListener("click",event=>{
  const add = event.target.closest("[data-add]");
  if(add) addProduct(add.dataset.add);
  const qty = event.target.closest("[data-qty]");
  if(qty) changeQuantity(qty.dataset.qty,Number(qty.dataset.change));
  const filter = event.target.closest("[data-filter]");
  if(filter){
    currentFilter = filter.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach(chip=>chip.classList.toggle("active",chip===filter));
    renderMenu();
  }
});
byId("open-cart").addEventListener("click",openCart);
byId("close-cart").addEventListener("click",closeCart);
byId("drawer-backdrop").addEventListener("click",closeCart);
byId("close-checkout").addEventListener("click",closeCheckout);
byId("go-checkout").addEventListener("click",openCheckout);
byId("packaging").addEventListener("change",updateCart);
byId("add-custom").addEventListener("click",addCustom);
byId("delivery").addEventListener("change",updateCheckoutOptions);
byId("payment").addEventListener("change",updateCheckoutOptions);
byId("checkout-form").addEventListener("submit",event=>{
  event.preventDefault();
  sendToWhatsApp(new FormData(event.currentTarget));
});
byId("pay-online").addEventListener("click",()=>{
  payOnline(new FormData(byId("checkout-form")));
});

// Exibe mensagem de retorno ao voltar do Mercado Pago.
const paymentStatus = new URLSearchParams(location.search).get("pagamento");
if(paymentStatus){
  const messages = {sucesso:"Pagamento aprovado! Obrigado pelo pedido.",falhou:"O pagamento não foi concluído. Se precisar, fale conosco pelo WhatsApp.",pendente:"Pagamento pendente de confirmação."};
  showToast(messages[paymentStatus] || "Status do pagamento atualizado.");
  history.replaceState({},document.title,location.pathname);
}

// Inicialização da página.
renderMenu();
renderIngredients();
updateCart();
checkPaymentSetup();
byId("year").textContent = new Date().getFullYear();
