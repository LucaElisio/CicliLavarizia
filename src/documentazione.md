# Documentazione Completa HTML + TypeScript - Cicli L'Avarizia

> **Data ultimo aggiornamento:** 14 Gennaio 2026  
> **Framework:** Angular 18+ con PrimeNG  
> **Autore:** Lorenzo

---

## 📑 Indice

1. [Panoramica Generale](#panoramica-generale)
2. [Struttura Base](#struttura-base)
3. [Componenti Core](#componenti-core)
   - 3.1 [Navbar Component](#3-navbar-component) - HTML + TypeScript completo
   - 3.2 [Footer Component](#4-footer-footercomponenthtml)
   - 3.3 [Sidebar Component](#5-sidebar-account-sidebarcomponenthtml)
4. [Pagine Features](#pagine-features)
   - 4.1 [Home Component](#6-home-component) - HTML + TypeScript completo
   - 4.2 [Products Page](#7-products-page-productcomponenthtml)
   - 4.3 [Product Info Page](#8-product-info-page-product-infocomponenthtml)
   - 4.4 [Cart Component](#9-cart-component) - HTML + TypeScript completo
   - 4.5 [Checkout/Sales Page](#10-checkoutsales-page-salecomponenthtml)
   - 4.6 [Profile Page](#11-profile-page-profilecomponenthtml)
   - 4.7 [Orders Page](#12-orders-page-ordercomponenthtml)
   - 4.8 [Auth Component](#13-auth-component) - HTML + TypeScript completo
   - 4.9 [Admin Dashboard](#14-admin-dashboard-admincomponenthtml)
   - 4.10 [Logistic Page](#15-logistic-page-logisticcomponenthtml)
   - 4.11 [Sales Assistant](#16-sales-assistant-page-assistantcomponenthtml)
5. [Services - Architettura](#services---architettura-e-logica-business)
   - 5.1 [AuthService](#1-authservice) - Gestione autenticazione
   - 5.2 [CartService](#2-cartservice) - Gestione carrello dual-mode
   - 5.3 [ProductService](#3-productservice) - API prodotti
6. [Pattern Comuni](#pattern-comuni)
   - 6.1 [Angular Control Flow](#1-angular-control-flow)
   - 6.2 [PrimeNG Components](#2-primeng-components-pattern)
   - 6.3 [Styling Patterns](#3-styling-patterns)
   - 6.4 [Material Icons](#4-material-icons-usage)
   - 6.5 [Form Patterns](#5-form-patterns)
7. [Note Tecniche](#note-tecniche)
   - 7.1 [Signals vs Observables](#signals-vs-observables)
   - 7.2 [Dependency Injection](#dependency-injection-con-inject)
   - 7.3 [Lifecycle Hooks](#lifecycle-hooks)
   - 7.4 [Reactive Forms](#reactive-forms-best-practices)
   - 7.5 [RxJS Operators](#rxjs-operators-comuni)
   - 7.6 [Error Handling](#error-handling-pattern)
   - 7.7 [Type Safety](#type-safety-con-models)
   - 7.8 [Computed Signals](#computed-signals-pattern)
8. [Future Implementazioni](#future-implementazioni)
9. [Convenzioni Codice](#convenzioni-codice-html)
10. [Risorse](#contatti-e-risorse)

---

## Panoramica Generale

L'applicazione "Cicli L'Avarizia" è un e-commerce per mountain bike costruito con **Angular 18+** e **PrimeNG**. Le pagine HTML utilizzano una combinazione di:

- **Angular Control Flow** (`@if`, `@for`, `@switch`)
- **PrimeNG Components** (p-card, p-button, p-table, etc.)
- **Tailwind CSS** per lo styling
- **Material Icons** per le icone
- **Reactive Forms** e **Signal-based State Management**

### Schema Colori Principali
```css
- Background principale: rgb(78, 86, 80)
- Testo principale: rgb(235, 238, 232)
- Testo secondario: rgb(190, 195, 188)
- Accento/CTA: rgb(170, 200, 170)
- Scuro: rgb(20, 20, 20)
```

---

## Struttura Base

### 1. `index.html`
**File:** `/src/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CicliLavarizia</title>
  <base href="/" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</head>
<body class="text-balance">
  <app-root></app-root>
</body>
</html>
```

**Caratteristiche:**
- Setup base HTML5
- Integrazione Material Icons
- Bootstrap component `<app-root>`

---

### 2. `app.html` (Layout Principale)
**File:** `/src/app/app.html`

```html
<app-navbar></app-navbar>
<div class="navbar-spacer"></div>
<main class="min-h-screen w-full mx-auto my-0 px-4 sm:px-6 lg:px-8 max-w-8xl">
  <router-outlet></router-outlet>
</main>
<app-footer></app-footer>
```

**Struttura:**
- Layout a 3 sezioni: Header, Main, Footer
- Navbar fixed con spacer
- Responsive padding (mobile-first)
- Max-width container per contenuto

**Modifiche Future:**
- [ ] Aggiungere breadcrumb navigation
- [ ] Implementare scroll-to-top button

---

## Componenti Core

### 3. Navbar Component

#### 3.1 HTML (`navbar.component.html`)
**File:** `/src/app/core/navbar/navbar.component.html`

**Sezioni Principali:**

##### Logo e Brand
```html
<h1>
  @if (CustomerRole === Roles.Admin || CustomerRole === Roles.Customer || CustomerRole === Roles.Guest) {
    <a routerLink="/" class="flex items-center gap-2">
      <span class="material-icons bike text-2xl">pedal_bike</span>
      <span class="text-xl md:text-2xl font-bold tracking-tight">Cicli L'Avarizia</span>
    </a>
  }
</h1>
```

##### Search Bar (Role-Based)
- Visibile solo per: Customer, Admin, Guest
- Reactive search con `FormControl`
- Dropdown risultati con scroll personalizzato
- Navigazione diretta ai prodotti

```html
<div class="relative w-full max-w-md search-wrapper">
  <form class="w-full">
    <input type="search" id="search" [formControl]="searchControl" 
           placeholder="Cerca prodotti..." />
  </form>
  
  @if(searchResultsShow() && searchResults().length > 0) {
    <div class="absolute top-full start-0 w-full mt-1 ...">
      @for(product of searchResults(); track $index) {
        <a routerLink="/product" [queryParams]="{productId: product.productId}">
          {{ product.name }}
        </a>
      }
    </div>
  }
</div>
```

##### Role-Based Navigation
```html
@switch (CustomerRole) {
  @case (Roles.Admin) {
    <a routerLink="/sales-assistant">Assistente di vendita</a>
    <a routerLink="/logistic">Logistica</a>
  }
  @case (Roles.SaleAssistant) {
    <a routerLink="/sales-assistant">Assistente di vendita</a>
  }
  @case (Roles.Logistic) {
    <a routerLink="/logistic">Logistica</a>
  }
}
```

##### Cart Badge
```html
<p-overlay-badge [value]="cartItemsCount()" badgeSize="small">
  <a routerLink="/cart">
    <span class="material-icons cart text-3xl">shopping_cart</span>
  </a>
</p-overlay-badge>
```

#### 3.2 TypeScript (`navbar.component.ts`)
**File:** `/src/app/core/navbar/navbar.component.ts`

**Imports e Decorators:**
```typescript
import { Component, inject, HostListener, signal, OnInit, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule, ReactiveFormsModule, RouterLink, 
    DrawerModule, SidebarComponent, CommonModule, OverlayBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
```

**Dependency Injection:**
```typescript
public authService = inject(AuthService);
public profileService = inject(ProfileService);
public cartService = inject(CartService);
private productService = inject(ProductService);
```

**State Management con Signals:**
```typescript
// Ruolo utente corrente
CustomerRole = this.authService.userInfo()?.role;
Roles = Role;

// Contatore carrello - calcola automaticamente il totale degli elementi
cartItemsCount = computed(() => {
  if (this.authService.isAuthenticated()) {
    // Carrello server per utenti autenticati
    return this.cartService.cartProducts()?.totalElements ?? 0;
  } else {
    // Carrello locale per guest
    const localCart = this.cartService.localCartItems();
    return localCart.reduce((sum, item) => sum + item.quantity, 0);
  }
});

// Risultati ricerca
searchResultsShow = signal<boolean>(false);
searchResults = signal<ProductResponse[]>([]);
```

**Scroll Behavior - Navbar Auto-Hide:**
```typescript
isNavbarVisible = true;
isAtTop = true;
private lastScrollTop = 0;
private scrollThreshold = 50;

@HostListener('window:scroll', [])
onWindowScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Determina se siamo in cima alla pagina
  this.isAtTop = scrollTop <= this.scrollThreshold;
  
  if (this.isAtTop) {
    // In cima: navbar sempre visibile
    this.isNavbarVisible = true;
  }
  // Nasconde navbar quando si scrolla verso il basso
  else if (scrollTop > this.lastScrollTop) {
    this.isNavbarVisible = false;
  }
  // Mostra navbar quando si scrolla verso l'alto
  else {
    this.isNavbarVisible = true;
  }
  
  this.lastScrollTop = scrollTop;
}
```

**Search Functionality:**
```typescript
searchControl = new FormControl('');

ngOnInit() {
  // Debounce search per evitare troppe chiamate API
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),        // Attendi 300ms dopo l'ultimo input
      distinctUntilChanged()    // Ignora valori duplicati consecutivi
    )
    .subscribe((value) => this.search(value));

  // Carica carrello se autenticato
  if (this.authService.isAuthenticated()) {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cartService.cartProducts.set(data);
      },
    });
  }
}

search(value: string | null) {
  if (!value || value.trim() === '') {
    this.searchResultsShow.set(false);
    this.searchResults.set([]);
    return;
  }

  this.productService.searchProducts(value).subscribe({
    next: (data) => {
      this.searchResults.set(data);
      this.searchResultsShow.set(true);
    },
    error: (err) => {
      console.error('Search error:', err);
      this.searchResults.set([]);
    }
  });
}
```

**Keyboard & Click Outside Handlers:**
```typescript
// Chiudi dropdown con ESC
@HostListener('document:keydown', ['$event'])
onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    this.searchResultsShow.set(false);
  }
}

// Chiudi dropdown cliccando fuori
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.search-wrapper')) {
    this.searchResultsShow.set(false);
  }
}

// Chiudi dropdown dopo selezione prodotto
closeSearch() {
  this.searchResultsShow.set(false);
  this.searchControl.setValue('');
}
```

**Modifiche Future:**
- [ ] Aggiungere autocomplete nella search
- [ ] Implementare cronologia ricerche (localStorage)
- [ ] Cache risultati ricerca
- [ ] Dark/Light mode toggle
- [ ] Notifiche badge

---

### 4. Footer (`footer.component.html`)
**File:** `/src/app/core/footer/footer.component.html`

**Struttura:**
```html
<footer class="mt-12 border-t border-gray-200 dark:border-gray-700">
  <div class="max-w-7xl mx-auto px-6 py-8">
    <!-- Logo + Descrizione -->
    <!-- Copyright -->
  </div>
</footer>
```

---

### 5. Sidebar Account (`sidebar.component.html`)
**File:** `/src/app/core/navbar/sidebar/sidebar.component.html`

**Pattern:**
- PrimeNG Drawer (right position)
- Avatar con iniziali
- Navigation links role-based
- Footer con logout

**Links Condizionali:**
```html
@if(CustomerRole === Roles.Customer || CustomerRole === Roles.Admin) {
  <a routerLink="/orders">Ordini</a>
  <a routerLink="/personal-reviews">Le mie recensioni</a>
}
```

---

## Pagine Features

### 6. Home Component

#### 6.1 HTML (`home.component.html`)
**File:** `/src/app/features/home/home.component.html`

**Sezioni:**

##### Hero Section
```html
<div class="w-full relative overflow-hidden rounded-xl h-85 md:h-105 lg:h-120">
  <img src="hero-section.jpg" alt="Hero Image" class="w-full h-full object-cover object-center" />
  
  <div class="absolute inset-0 bg-black/50 flex items-center justify-center pt-6">
    <div class="text-center text-white px-6 max-w-2xl">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Domina il sentiero!</h1>
      <p class="text-lg md:text-xl text-gray-200">
        Mountain Bikes costruite per l'avidità di adrenalina. 
        Performance estrema per chi non si accontenta mai.
      </p>
    </div>
  </div>
</div>
```

##### Carousel Prodotti in Evidenza
```html
<p-card header="Prodotti in evidenza">
  <p-carousel 
    [value]="randomProducts()" 
    [numVisible]="3" 
    [numScroll]="3" 
    [circular]="true"
    [showIndicators]="false" 
    [responsiveOptions]="productResponsiveOptions" 
    [autoplayInterval]="5000">
    
    <ng-template let-product #item>
      <p-card>
        <div class="mb-4 font-medium">{{ product.name }}</div>
        <img [src]="product.thumbNailPhoto" [alt]="product.thumbnailPhotoFileName"
             class="h-48 object-contain mb-3 rounded" loading="lazy" />
        <div class="flex justify-between items-center">
          <div class="mt-0 font-semibold text-xl">{{ product.listPrice + ' €' }}</div>
        </div>
        <ng-template #footer>
          <a pButton routerLink="/product" 
             [queryParams]="{productId: product.productId}">Dettagli</a>
        </ng-template>
      </p-card>
    </ng-template>
  </p-carousel>
</p-card>
```

##### Esplora Categorie
```html
<p-card header="Esplora le categorie">
  <div class="flex my-6 flex-row items-center justify-evenly gap-4 overflow-x-auto">
    @for (category of categories(); track $index) {
      <a class="p-button p-button-outlined mb-6 shrink-0" 
         [routerLink]="['/products']" 
         [queryParams]="{category: category.name}">
        {{ category.name }}
      </a>
    }
  </div>
</p-card>
```

#### 6.2 TypeScript (`home.component.ts`)
**File:** `/src/app/features/home/home.component.ts`

**Component Setup:**
```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ProductCategoryResponse, ProductResponse } from '../../shared/models/productModel';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-home',
  imports: [CarouselModule, CardModule, ButtonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  
  // State con Signals
  randomProducts = signal<ProductResponse[]>([]);
  categories = signal<ProductCategoryResponse[]>([]);
  
  // Configurazione responsive per PrimeNG Carousel
  productResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];
  
  categoryResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 5, numScroll: 2 },
    { breakpoint: '768px', numVisible: 3, numScroll: 1 },
    { breakpoint: '560px', numVisible: 2, numScroll: 1 },
  ];
  
  ngOnInit(): void {
    // Carica prodotti random per carousel
    this.productService.getRandomProducts().subscribe({
      next: (data) => {
        this.randomProducts.set(data);
      },
      error: (err) => console.error('Errore caricamento prodotti random:', err)
    });
    
    // Carica tutte le categorie
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
      error: (err) => console.error('Errore caricamento categorie:', err)
    });
  }
}
```

**Spiegazione Codice:**
- **Signals**: `randomProducts` e `categories` sono reactive signals che aggiornano automaticamente la UI quando cambiano
- **Responsive Options**: Array di configurazioni per adattare il carousel a diverse dimensioni schermo
- **OnInit Lifecycle**: Carica i dati all'inizializzazione del componente
- **Error Handling**: Ogni chiamata HTTP ha gestione errori per debugging
- Button outlined
- Link con query params

---

### 7. Products Page (`product.component.html`)
**File:** `/src/app/features/product/product.component.html`

**Struttura Complessa:**

#### 7.1 Sidebar Floating con Filtri
```html
<div class="sidebar-wrapper">
  <p-card class="sidebar" header="Categorie">
    <!-- Filtri visibili quando è selezionato un modello -->
    @if(selectedModel) {
      <!-- Slider grandezza pagina -->
      <!-- Slider range prezzo -->
    }
  </p-card>
</div>
```

**Filtri Disponibili:**
- Page Size (slider 3-99)
- Price Range (slider 0-10000)
- Categorie cliccabili

#### 7.2 Vista Modelli (Default)
- Grid 3 colonne
- Card modelli cliccabili
- Paginazione (9, 18, 27 per pagina)

#### 7.3 Vista Prodotti per Modello
- Header con breadcrumb
- Bottone "Torna ai Modelli"
- Grid prodotti con immagini
- Add to cart button

#### 7.4 Vista per Categoria
- Filtro automatico per categoria
- Stessa struttura vista modelli


---

### 8. Product Info Page (`product-info.component.html`)
**File:** `/src/app/features/product/product-info/product-info.component.html`

**Layout:**
```
┌─────────────────────────────────────┐
│  [← Indietro]                       │
├──────────────┬──────────────────────┤
│              │  Nome Prodotto       │
│   Immagine   │  Codice             │
│              │  € Prezzo           │
│              │  Specifiche         │
│              │  [Add to Cart]      │
├──────────────┴──────────────────────┤
│  Descrizione                        │
├─────────────────────────────────────┤
│  Recensioni (component)             │
└─────────────────────────────────────┘
```

**Caratteristiche:**
- Grid responsive (2 col desktop, 1 mobile)
- Immagine centrata con background
- Specifiche in tabella
- Card recensioni separata


---

### 9. Cart Component

#### 9.1 HTML (`cart.html`)
**File:** `/src/app/features/cart/cart.html`

**Layout 2 Colonne:**

##### Lista Prodotti (lg:col-span-2)
```html
@for (product of groupedProducts(); track product.productId) {
  <p-card [style]="{'background-color': 'rgb(78, 86, 80)', 'border-radius': '8px'}">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Immagine -->
      <div class="shrink-0">
        <img [src]="product.thumbNailPhoto" [alt]="product.name"
             class="w-full md:w-32 h-32 object-cover rounded-lg" />
      </div>
      
      <!-- Dettagli Prodotto -->
      <div class="flex-1">
        <h3 class="text-xl font-bold">{{ product.name }}</h3>
        <p><strong>Prezzo unitario:</strong> {{ product.listPrice | number:'1.2-2' }} €</p>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-2">
          <p-button [outlined]="true" size="small"
                    [disabled]="product.quantity <= 1"
                    (onClick)="decreaseQuantity(product.productId, product.quantity)">
            keyboard_double_arrow_left
          </p-button>
          <span class="font-bold">{{ product.quantity }}</span>
          <p-button [outlined]="true" size="small"
                    (onClick)="increaseQuantity(product.productId, product.quantity)">
            keyboard_double_arrow_right
          </p-button>
        </div>
        
        <p class="text-lg font-bold mt-2">
          <strong>Subtotale:</strong> {{ (product.listPrice * product.quantity) | number:'1.2-2' }} €
        </p>
      </div>
    </div>
  </p-card>
}
```

##### Riepilogo Carrello (Sticky)
```html
<p-card [style]="{'position': 'sticky', 'top': '20px'}">
  <ng-template pTemplate="header">
    <h2 class="text-2xl font-bold">
      <span class="material-icons mr-2">shopping_cart</span>
      Riepilogo
    </h2>
  </ng-template>
  
  <div class="flex justify-between">
    <span>Articoli:</span>
    <span class="font-bold">{{ totalElements() }}</span>
  </div>
  
  <div class="flex justify-between text-xl font-bold">
    <span>Totale:</span>
    <span>{{ totalPrice() | number:'1.2-2' }} €</span>
  </div>
  
  <p-button label="Procedi al Checkout" 
            [disabled]="totalElements() === 0" 
            routerLink="/sales">
  </p-button>
</p-card>
```

#### 9.2 TypeScript (`cart.ts`)
**File:** `/src/app/features/cart/cart.ts`

**Component Setup:**
```typescript
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { ProductService } from '../../shared/services/product.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [CardModule, CommonModule, Button, RouterLink, DividerModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  
  // State Signals
  localCartProducts = signal<any[]>([]);
  isLoadingLocalCart = signal<boolean>(false);
  
  // Computed Signals - si aggiornano automaticamente quando le dipendenze cambiano
  cartProducts = computed(() => this.cartService.cartProducts());
  
  totalElements = computed(() => {
    if (!this.authService.isAuthenticated()) {
      // Carrello locale: somma tutte le quantità
      return this.localCartProducts().reduce((sum, p) => sum + p.quantity, 0);
    }
    // Carrello server: usa totalElements dalla response
    return this.cartService.cartProducts()?.totalElements ?? 0;
  });
  
  totalPrice = computed(() => {
    if (!this.authService.isAuthenticated()) {
      // Carrello locale: calcola totale manualmente
      return this.localCartProducts().reduce(
        (sum, p) => sum + (p.listPrice * p.quantity), 0
      );
    }
    // Carrello server: usa totalAmount dalla response
    return this.cartService.cartProducts()?.totalAmount ?? 0;
  });
  
  // Raggruppa prodotti duplicati sommando le quantità
  groupedProducts = computed(() => {
    if (!this.authService.isAuthenticated()) {
      return this.localCartProducts();
    }
    
    const products = this.cartService.cartProducts()?.products;
    if (!products) return [];
    
    // Usa Map per raggruppare prodotti con stesso productId
    const grouped = new Map();
    products.forEach(product => {
      if (grouped.has(product.productId)) {
        grouped.get(product.productId).quantity++;
      } else {
        grouped.set(product.productId, { ...product, quantity: 1 });
      }
    });
    
    // Ordina per productId per mantenere l'ordine consistente
    return Array.from(grouped.values()).sort((a, b) => a.productId - b.productId);
  });
  
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.getCart();  // Carica carrello dal server
    } else {
      this.loadLocalCart();  // Carica carrello locale
    }
  }
  
  getCart() {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cartService.cartProducts.set(data);
      },
      error: (err) => {
        console.error('Errore recupero carrello dal server:', err);
      },
    });
  }
  
  /**
   * Carica i dettagli completi dei prodotti nel carrello locale
   * Il localStorage salva solo productId e quantity, qui recuperiamo
   * nome, prezzo, immagine, etc. dal backend
   */
  loadLocalCart() {
    const localCart = this.cartService.getLocalCart();
    if (localCart.length === 0) {
      this.localCartProducts.set([]);
      this.isLoadingLocalCart.set(false);
      return;
    }
    
    this.isLoadingLocalCart.set(true);
    
    // Crea array di Observable per ogni prodotto
    const productRequests = localCart.map(item =>
      this.productService.getProductById(item.productId).pipe(
        map(product => ({ ...product, quantity: item.quantity }))
      )
    );
    
    // forkJoin attende che tutte le richieste completino
    forkJoin(productRequests).subscribe({
      next: (products) => {
        this.localCartProducts.set(products);
        this.isLoadingLocalCart.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento prodotti carrello locale:', err);
        this.isLoadingLocalCart.set(false);
      }
    });
  }
  
  /**
   * Incrementa quantità prodotto
   * Se autenticato: aggiorna su server
   * Se guest: aggiorna localStorage
   */
  increaseQuantity(productId: number, currentQuantity: number) {
    const newQuantity = currentQuantity + 1;
    
    if (this.authService.isAuthenticated()) {
      this.cartService.addToCart(productId, newQuantity).subscribe({
        next: () => this.getCart(),
        error: (err) => console.error('Errore aggiornamento quantità:', err)
      });
    } else {
      this.cartService.updateLocalCartQuantity(productId, newQuantity);
      this.loadLocalCart();
    }
  }
  
  /**
   * Decrementa quantità prodotto
   * Non può scendere sotto 1 (il button è disabled)
   */
  decreaseQuantity(productId: number, currentQuantity: number) {
    if (currentQuantity <= 1) return;
    
    const newQuantity = currentQuantity - 1;
    
    if (this.authService.isAuthenticated()) {
      this.cartService.addToCart(productId, newQuantity).subscribe({
        next: () => this.getCart(),
        error: (err) => console.error('Errore aggiornamento quantità:', err)
      });
    } else {
      this.cartService.updateLocalCartQuantity(productId, newQuantity);
      this.loadLocalCart();
    }
  }
  
  /**
   * Rimuove completamente un prodotto dal carrello
   * Mostra dialog di conferma prima della rimozione
   */
  removeProduct(productId: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler rimuovere questo prodotto dal carrello?',
      header: 'Conferma Rimozione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.authService.isAuthenticated()) {
          this.cartService.removeFromCart(productId).subscribe({
            next: () => this.getCart(),
            error: (err) => console.error('Errore rimozione prodotto:', err)
          });
        } else {
          this.cartService.removeFromLocalCart(productId);
          this.loadLocalCart();
        }
      }
    });
  }
}
```

**Spiegazione Codice:**
- **Dual Mode**: Gestisce sia carrello server (autenticati) che locale (guest)
- **Computed Signals**: `totalElements`, `totalPrice` e `groupedProducts` si ricalcolano automaticamente
- **forkJoin**: Esegue richieste HTTP in parallelo per caricare dettagli prodotti
- **Confirm Dialog**: Chiede conferma prima di rimuovere prodotti
- **Error Handling**: Ogni operazione ha gestione errori

**Modifiche Future:**
- [ ] Salva per dopo
- [ ] Codici sconto/coupon
- [ ] Calcolo spedizione in tempo reale
- [ ] Quantità bulk update
- [ ] Timer promozioni

---

### 10. Checkout/Sales Page (`sale.component.html`)
**File:** `/src/app/features/sale/sale.component/sale.component.html`

**Form Sezioni:**

#### 10.1 Indirizzo Spedizione
```html
<p-card>
  <!-- addressLine1, addressLine2 -->
  <!-- city, postalCode -->
  <!-- stateProvince, countryRegion -->
</p-card>
```

#### 10.2 Indirizzo Fatturazione
- Checkbox "Usa stesso indirizzo"
- Conditional form `*ngIf="!useSameAddress"`
- Stessi campi shipping

#### 10.3 Pagamento e Spedizione
```html
<p-card>
  <!-- Credit card approval code -->
  <!-- Ship method selector -->
  <!-- Altri dettagli pagamento -->
</p-card>
```

---

### 11. Profile Page (`profile.component.html`)
**File:** `/src/app/features/profile/profile.component.html`

**Struttura:**

#### 11.1 Header Profilo
```html
<p-card>
  <div class="flex flex-col md:flex-row items-center gap-6">
    <h1>{{ firstName }} {{ lastName }}</h1>
    <p>{{ email }}</p>
  </div>
</p-card>
```

#### 11.2 Informazioni Dettagliate
- Lista key-value pairs
- Nome, Cognome, Middle Name
- Email, Phone, Suffix
- Sales Person, Company Name
- Indirizzi (loop)

#### 11.3 Footer Actions
```html
<a routerLink="/auth/delete" pButton severity="danger">Elimina profilo</a>
<p-button text (onClick)="showDialogEmail()">Aggiorna Email</p-button>
<p-button text (onClick)="showDialogPassword()">Aggiorna Password</p-button>
<p-button text (onClick)="showDialogUpdateInfo()">Modifica profilo</p-button>
```

#### 11.4 Dialogs Modali
1. **Update Email Dialog** - Input email + validation
2. **Update Password Dialog** - Password field con toggle
3. **Update Info Dialog** - Multi-field form



---

### 12. Orders Page (`order.component.html`)
**File:** `/src/app/features/order/order.component.html`

**Pattern:**

#### 12.1 Table con PrimeNG
```html
<p-table #dt [value]="orders()" [paginator]="true" [rows]="10">
  <ng-template pTemplate="caption">
    <!-- Search bar -->
  </ng-template>
  
  <ng-template pTemplate="header">
    <!-- Sortable columns -->
  </ng-template>
  
  <ng-template pTemplate="body" let-order>
    <!-- Order row -->
  </ng-template>
</p-table>
```


#### 12.2 Dialog Dettagli
```html
<p-dialog [(visible)]="displayDialog" [modal]="true">
  <!-- Order header info -->
  <!-- Products table -->
  <!-- Order summary -->
</p-dialog>
```


---

### 13. Auth Component

#### 13.1 HTML (`auth.component.html`)
**File:** `/src/app/core/auth/auth.component.html`

**Pattern Dual-Mode:**

##### Login Form
```html
@if (isLoginPage) {
  <p-card header="Login">
    <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
      <!-- Email Input -->
      <p-inputgroup>
        <p-inputgroup-addon>
          <i class="material-icons">email</i>
        </p-inputgroup-addon>
        <p-floatlabel variant="on">
          <input pInputText type="email" id="emailAddress" formControlName="emailAddress" />
          <label for="emailAddress">Email</label>
        </p-floatlabel>
      </p-inputgroup>
      
      <!-- Password Input -->
      <p-inputgroup>
        <p-inputgroup-addon>
          <i class="material-icons">lock</i>
        </p-inputgroup-addon>
        <p-floatlabel variant="on">
          <p-password formControlName="password" id="password" 
                      [feedback]="false" [toggleMask]="true"></p-password>
          <label for="password">Password</label>
        </p-floatlabel>
      </p-inputgroup>
      
      <!-- Error Message -->
      @if (error()) {
        <p-message severity="error">{{ error() }}</p-message>
      }
      
      <!-- Submit Button -->
      <p-button type="submit" [disabled]="!authForm.valid || isLoading()">
        <ng-template pTemplate="content">
          @if (!isLoading()) { Login } 
          @else {
            <p-progress-spinner strokeWidth="8" animationDuration=".5s" 
                               [style]="{ width: '25px', height: '25px' }" />
          }
        </ng-template>
      </p-button>
      
      <p-button text (onClick)="showDialog()" label="Forgot Password?"></p-button>
      <p>New User?<a routerLink="/auth/register">Register</a></p>
    </form>
  </p-card>
}
```

##### Register Form
```html
@else {
  <p-card header="Register">
    <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
      <!-- First Name & Last Name -->
      <div class="flex gap-4">
        <p-inputgroup class="flex-1">
          <p-inputgroup-addon><i class="material-icons">person</i></p-inputgroup-addon>
          <p-floatlabel variant="on">
            <input formControlName="firstName" pInputText type="text" />
            <label>First Name</label>
          </p-floatlabel>
        </p-inputgroup>
        
        <p-inputgroup class="flex-1">
          <p-inputgroup-addon><i class="material-icons">person</i></p-inputgroup-addon>
          <p-floatlabel variant="on">
            <input formControlName="lastName" pInputText type="text" />
            <label>Last Name</label>
          </p-floatlabel>
        </p-inputgroup>
      </div>
      
      <!-- Email, Password, Confirm Password -->
      <!-- ... simile a Login Form ... -->
    </form>
  </p-card>
}
```

##### Forgot Password Dialog
```html
<p-dialog header="Update Password" [(visible)]="visible" [modal]="true">
  <div class="flex items-center gap-4 mb-8">
    <label for="email">Email</label>
    <input pInputText id="email" type="email" [formControl]="inputEmail" />
  </div>
  <div class="flex items-center gap-4 mb-8">
    <label for="password">New Password</label>
    <p-password [formControl]="inputPassword" id="password" 
                [feedback]="false" [toggleMask]="true"></p-password>
  </div>
  @if (error()) {
    <p-message severity="error">{{ error() }}</p-message>
  }
  <div class="flex justify-end gap-2">
    <p-button label="Cancel" severity="secondary" (click)="visible = false" />
    <p-button [disabled]="!inputPassword.valid" label="Update" (onClick)="updatePassword()" />
  </div>
</p-dialog>
```

#### 13.2 TypeScript (`auth.component.ts`)
**File:** `/src/app/core/auth/auth.component.ts`

**Component Setup:**
```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CartService } from '../../shared/services/cart.service';
import { LoginRequest, RegisterRequest } from '../../shared/models/authModel';
import { Role } from '../../shared/models/customerModel';

@Component({
  selector: 'app-auth',
  imports: [
    DialogModule, InputGroupAddonModule, ProgressSpinnerModule,
    MessageModule, CardModule, PasswordModule, InputTextModule,
    InputGroupModule, FloatLabelModule, ButtonModule, RouterLink, ReactiveFormsModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  
  // State
  isLoginPage: boolean = false;
  authForm!: FormGroup;
  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  visible: boolean = false;
  
  // Form Controls per Forgot Password Dialog
  inputPassword: FormControl = new FormControl('', Validators.minLength(8));
  inputEmail: FormControl = new FormControl('', Validators.email);
  
  ngOnInit(): void {
    // Determina se siamo su /login o /register guardando l'URL
    this.activatedRoute.url.subscribe({
      next: (data) => {
        this.isLoginPage = data[data.length - 1].path === 'login';
        this.generateForm();  // Genera il form appropriato
      },
    });
  }
  
  /**
   * Genera il FormGroup dinamicamente in base alla pagina
   * Login: solo email e password
   * Register: aggiunge firstName, lastName, confirmPassword
   */
  private generateForm() {
    if (this.isLoginPage) {
      this.authForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      });
    } else {
      this.authForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      });
    }
  }
  
  /**
   * Gestisce submit sia per Login che per Register
   */
  onSubmit() {
    this.isLoading.set(true);
    
    if (this.isLoginPage && this.authForm.valid) {
      this.handleLogin();
    } else if (!this.isLoginPage && this.authForm.valid) {
      this.handleRegister();
    }
  }
  
  /**
   * Login Flow:
   * 1. Chiama API login
   * 2. Salva token in localStorage
   * 3. Aggiorna auth state
   * 4. Merge carrello locale → server (se Customer/Admin)
   * 5. Redirect basato su ruolo
   */
  private handleLogin() {
    const userData: LoginRequest = this.authForm.value;
    
    this.authService.login(userData).subscribe({
      next: (data) => {
        // Salva JWT token
        localStorage.setItem('token', data.token);
        this.authService.changeAuthState();
        this.error.set(null);
        this.authForm.reset();
        
        const userRole = this.authService.userInfo()?.role;
        
        // Trasferisci carrello locale al DB per Customer/Admin
        if (userRole === Role.Admin || userRole === Role.Customer) {
          this.cartService.mergeLocalCartToServer().subscribe({
            next: () => {
              this.isLoading.set(false);
              this.router.navigate(['/']);  // Vai alla home
            },
            error: (err) => {
              console.error('Errore merge carrello:', err);
              this.isLoading.set(false);
              this.router.navigate(['/']);  // Vai comunque alla home
            }
          });
        } 
        // Redirect diretto per Logistic e SaleAssistant
        else if (userRole === Role.Logistic) {
          this.isLoading.set(false);
          this.router.navigate(['/logistic']);
        } else if (userRole === Role.SaleAssistant) {
          this.isLoading.set(false);
          this.router.navigate(['/sales-assistant']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error.detail);
      },
    });
  }
  
  /**
   * Register Flow:
   * 1. Chiama API register
   * 2. Redirect a login
   */
  private handleRegister() {
    const userData: RegisterRequest = this.authForm.value;
    
    this.authService.register(userData).subscribe({
      next: () => {
        this.error.set(null);
        this.authForm.reset();
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error.detail);
      },
    });
  }
  
  /**
   * Update Password da Forgot Password Dialog
   */
  updatePassword() {
    if (this.inputPassword.valid && this.inputEmail.valid) {
      const userData = {
        emailAddress: this.inputEmail.value,
        password: this.inputPassword.value,
      };
      
      this.authService.updatePassword(userData).subscribe({
        next: () => {
          this.visible = false;
          this.error.set(null);
          this.inputEmail.reset();
          this.inputPassword.reset();
        },
        error: (err) => {
          this.error.set(err.error.detail);
        },
      });
    }
  }
  
  showDialog() {
    this.visible = true;
  }
}
```

**Spiegazione Codice:**
- **Dual Form**: Un solo component gestisce sia login che register
- **Dynamic Form Generation**: Form cambia struttura in base all'URL
- **Role-Based Redirect**: Dopo login, redirect diverso per ogni ruolo
- **Cart Merge**: Carrello locale viene trasferito al server dopo login
- **Error Handling**: Mostra errori API in modo user-friendly
- **Loading State**: Disabilita form e mostra spinner durante richieste

**Modifiche Future:**
- [ ] Social login (Google, Facebook)
- [ ] Email verification
- [ ] Password strength indicator
- [ ] reCAPTCHA
- [ ] Terms & conditions checkbox

---

### 14. Admin Dashboard (`admin.component.html`)
**File:** `/src/app/features/admin.component/admin.component.html`

**Struttura Tab View:**

```html
<p-selectbutton 
  [(ngModel)]="currentView" 
  [options]="viewOptions"
  (onChange)="onViewChange()" />
```

#### 14.1 Vista Clienti
```html
@if (currentView === 'customers') {
  <p-table [value]="customers" [paginator]="true">
    <!-- Columns: ID, Nome, Cognome, Azienda, Telefono, Città -->
  </p-table>
}
```

#### 14.2 Vista Dipendenti
```html
@if (currentView === 'employees') {
  <p-table [value]="employees">
    <!-- Email, Ruolo Attuale, Dropdown Modifica, Azione -->
  </p-table>
}
```

**Features:**
- Role selector dropdown
- Tag severity per ruoli
- Update button con loading state
- Empty state messages


---

### 15. Logistic Page (`logistic.component.html`)
**File:** `/src/app/features/logistic/logistic.component.html`

**Pattern:**

#### 15.1 Table Ordini
```html
<table class="orders-table">
  @for (order of orders$ | async; track order.salesOrderId) {
    <!-- Riga principale -->
    <tr>
      <td>{{ order.salesOrderNumber }}</td>
      <td>{{ getStatusLabel(order.status) }}</td>
      <td>{{ order.totalDue }} €</td>
      <td><button (click)="openDetail(order)">info</button></td>
    </tr>
    
    <!-- Riga dettaglio (espandibile) -->
    @if (activeOrder?.salesOrderId === order.salesOrderId) {
      <tr class="detail-row">
        <!-- Vista dettaglio o modifica -->
      </tr>
    }
  }
</table>
```

#### 15.2 Row Modes
1. **Detail Mode:** Visualizzazione info
2. **Edit Mode:** Form modifica (ShipDate, DueDate, Status)

**Controlli Condizionali:**
```html
[disabled]="!canEdit(order)"
```

---

### 16. Sales Assistant Page (`assistant.component.html`)
**File:** `/src/app/features/saleAssistant/assistant.component/assistant.component.html`

**Multi-Section Interface:**

```html
<div class="mb-6 flex gap-2">
  <p-button (onClick)="setActiveSection('product')">Prodotti</p-button>
  <p-button (onClick)="setActiveSection('category')">Categorie</p-button>
  <p-button (onClick)="setActiveSection('model')">Modelli</p-button>
  <p-button (onClick)="setActiveSection('discount')">Sconti</p-button>
</div>
```

#### 16.1 Sezione Prodotti
**Form Campi:**
- Nome Prodotto, Numero Prodotto
- Colore, Taglia
- Costo Standard, Prezzo Listino
- Peso
- Categoria (dropdown)
- Modello Prodotto (dropdown)
- Data Inizio Vendita (datepicker)
- Upload Immagine (file input)

**Validazione:**
```html
<p class="text-sm">
  <i class="material-icons">info</i>
  I campi contrassegnati con * sono obbligatori
</p>
```

#### 16.2 Sezione Categorie
- Form creazione categoria
- Lista categorie esistenti

#### 16.3 Sezione Modelli
- Form creazione modello
- Descrizione modello

#### 16.4 Sezione Sconti
- Form gestione sconti/promozioni


---

## Pattern Comuni

### 1. Angular Control Flow

#### Conditional Rendering
```html
@if (condition) {
  <!-- Content -->
} @else {
  <!-- Alternative -->
}
```

#### Loops
```html
@for (item of items(); track item.id) {
  <!-- Item template -->
} @empty {
  <!-- Empty state -->
}
```

#### Switch
```html
@switch (value) {
  @case (option1) { /* Content */ }
  @case (option2) { /* Content */ }
  @default { /* Fallback */ }
}
```

### 2. PrimeNG Components Pattern

#### Card
```html
<p-card [style]="{'background-color': 'rgb(78, 86, 80)'}">
  <ng-template pTemplate="header"><!-- Header --></ng-template>
  <!-- Body -->
  <ng-template pTemplate="footer"><!-- Footer --></ng-template>
</p-card>
```

#### Button
```html
<p-button 
  label="Text" 
  [outlined]="true"
  severity="danger"
  (onClick)="handler()"
  [style]="{...}">
</p-button>
```

#### Dialog
```html
<p-dialog 
  [(visible)]="visible" 
  [modal]="true"
  header="Title"
  [style]="{width: '25rem'}">
  <!-- Content -->
</p-dialog>
```

#### Table
```html
<p-table 
  [value]="data()" 
  [paginator]="true"
  [rows]="10">
  <ng-template pTemplate="header"><!-- Columns --></ng-template>
  <ng-template pTemplate="body" let-item><!-- Row --></ng-template>
</p-table>
```

### 3. Styling Patterns

#### Color Scheme Classes
```css
style="color: rgb(235, 238, 232);"        /* Testo principale */
style="color: rgb(190, 195, 188);"        /* Testo secondario */
style="background-color: rgb(78, 86, 80);" /* Card background */
style="background-color: rgb(170, 200, 170); color: rgb(20, 20, 20);" /* CTA */
```

#### Responsive Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### Flexbox Patterns
```html
<div class="flex flex-col md:flex-row items-center justify-between gap-4">
```

### 4. Material Icons Usage
```html
<span class="material-icons">icon_name</span>
<i class="material-icons">icon_name</i>
```

**Comuni:**
- `pedal_bike` - Logo
- `shopping_cart` - Carrello
- `search` - Ricerca
- `person` - Utente
- `edit` - Modifica
- `delete` - Elimina
- `info` - Informazioni
- `add_shopping_cart` - Aggiungi al carrello

### 5. Form Patterns

#### Reactive Forms
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input pInputText formControlName="field" />
</form>
```

#### Two-Way Binding
```html
<input pInputText [(ngModel)]="variable" />
```

#### PrimeNG Form Components
```html
<p-inputgroup>
  <p-inputgroup-addon><i class="material-icons">icon</i></p-inputgroup-addon>
  <p-floatlabel variant="on">
    <input pInputText formControlName="field" />
    <label>Label</label>
  </p-floatlabel>
</p-inputgroup>
```

---

## Services - Architettura e Logica Business

### 1. AuthService
**File:** `/src/app/shared/services/auth.service.ts`

**Responsabilità:**
- Gestione autenticazione (login, register, logout)
- Storage e refresh JWT token
- Decode token per estrarre user info
- Gestione stato autenticazione con signals

**Codice:**
```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, UpdateEmailRequest } from '../models/authModel';
import { TokenDecoded, TokenResponse } from '../models/tokenModel';
import { Role } from '../models/customerModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  
  // Signals per state management reattivo
  public isAuthenticated = signal<boolean>(false);
  public userInfo = signal<TokenDecoded | null>(null);
  public customerInfo = signal<CustomerInfoRequest | null>(null);
  
  // Subject per gestire refresh token
  isRefreshing = false;
  refreshSubject = new BehaviorSubject<string | null>(null);
  
  // Token default per utenti Guest
  TokenGuest: TokenDecoded = {
    email: '',
    role: Role.Guest,
  }
  
  /**
   * Login - Restituisce JWT token
   * withCredentials: true permette invio/ricezione cookies (refresh token)
   */
  login(userData: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.url}/Auth/Login`, 
      userData, 
      { withCredentials: true }
    );
  }
  
  /**
   * Register - Crea nuovo account
   * Dopo registrazione, user deve fare login manualmente
   */
  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/Auth/Register`, userData);
  }
  
  /**
   * Logout - Invalida refresh token sul server
   */
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.url}/Auth/Logout`, 
      {}, 
      { withCredentials: true }
    );
  }
  
  /**
   * Refresh - Ottiene nuovo JWT usando refresh token dal cookie
   * Chiamato automaticamente dall'interceptor quando token scade
   */
  refresh(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.url}/Auth/Refresh`, 
      {}, 
      { withCredentials: true }
    );
  }
  
  /**
   * Delete Account - Elimina account utente corrente
   */
  delete(): Observable<void> {
    return this.http.delete<void>(`${this.url}/Auth/Delete`);
  }
  
  /**
   * Update Email - Cambia email utente
   */
  updateEmail(newEmail: UpdateEmailRequest): Observable<void> {
    return this.http.put<void>(
      `${this.url}/Auth/UpdateEmailAddress`, 
      newEmail, 
      { withCredentials: true }
    );
  }
  
  /**
   * Update Password - Reset password (forgot password flow)
   */
  updatePassword(userData: LoginRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/Auth/RefreshPassword`, userData);
  }
  
  /**
   * Cambia stato autenticazione leggendo token da localStorage
   * Decodifica JWT per estrarre email e ruolo
   * Chiamato dopo login e all'avvio app
   */
  changeAuthState() {
    const token = localStorage.getItem('token');
    
    if (token) {
      this.isAuthenticated.set(true);
      // Decodifica JWT per ottenere payload
      const decoded: TokenDecoded = jwtDecode(token);
      this.userInfo.set(decoded);
    } else {
      this.isAuthenticated.set(false);
      this.userInfo.set(this.TokenGuest);  // Imposta ruolo Guest
    }
  }
}
```

**Spiegazione:**
- **JWT Storage**: Token salvato in localStorage, refresh token in httpOnly cookie
- **Automatic Decode**: jwtDecode estrae automaticamente email e role dal token
- **Signals**: `isAuthenticated` e `userInfo` aggiornano automaticamente tutta l'app
- **Guest Mode**: Utenti non autenticati hanno ruolo Guest

---

### 2. CartService
**File:** `/src/app/shared/services/cart.service.ts`

**Responsabilità:**
- Gestione dual-mode: carrello server (DB) e carrello locale (localStorage)
- CRUD operazioni carrello
- Merge carrello locale → server dopo login
- Sincronizzazione automatica

**Codice:**
```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, forkJoin, from, concatMap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../models/cartModel';
import { ProductService } from './product.service';

interface LocalCartItem {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private url = environment.apiUrl;
  private localCartKey = 'localCart';
  
  // State Signals
  cartProducts = signal<CartResponse | null>(null);
  localCartItems = signal<LocalCartItem[]>(this.initLocalCart());
  
  /**
   * Inizializza carrello locale dal localStorage all'avvio
   */
  private initLocalCart(): LocalCartItem[] {
    const cart = localStorage.getItem(this.localCartKey);
    return cart ? JSON.parse(cart) : [];
  }
  
  // ========== GESTIONE CARRELLO LOCALE (Guest) ==========
  
  /**
   * Legge carrello da localStorage
   */
  getLocalCart(): LocalCartItem[] {
    const cart = localStorage.getItem(this.localCartKey);
    const parsedCart = cart ? JSON.parse(cart) : [];
    this.localCartItems.set(parsedCart);
    return parsedCart;
  }
  
  /**
   * Salva carrello in localStorage e aggiorna signal
   */
  saveLocalCart(cart: LocalCartItem[]): void {
    localStorage.setItem(this.localCartKey, JSON.stringify(cart));
    this.localCartItems.set(cart);
  }
  
  /**
   * Aggiunge prodotto al carrello locale
   * Se già presente, incrementa quantità
   */
  addToLocalCart(productId: number, quantity: number): void {
    const cart = this.getLocalCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    this.saveLocalCart(cart);
  }
  
  /**
   * Rimuove prodotto dal carrello locale
   */
  removeFromLocalCart(productId: number): void {
    const cart = this.getLocalCart().filter(item => item.productId !== productId);
    this.saveLocalCart(cart);
  }
  
  /**
   * Aggiorna quantità prodotto nel carrello locale
   */
  updateLocalCartQuantity(productId: number, newQuantity: number): void {
    const cart = this.getLocalCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
      item.quantity = newQuantity;
      this.saveLocalCart(cart);
    }
  }
  
  /**
   * Svuota completamente carrello locale
   */
  clearLocalCart(): void {
    localStorage.removeItem(this.localCartKey);
    this.localCartItems.set([]);
  }
  
  // ========== GESTIONE CARRELLO SERVER (Autenticati) ==========
  
  /**
   * Recupera carrello dal server
   */
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.url}/Cart`);
  }
  
  /**
   * Aggiunge prodotto al carrello server
   * Quantity è ASSOLUTA, non incrementale
   */
  addToCart(productId: number, quantity: number = 1): Observable<void> {
    return this.http.post<void>(
      `${this.url}/Cart/AddToCart`, 
      { productId, quantity }
    );
  }
  
  /**
   * Rimuove prodotto dal carrello server
   */
  removeFromCart(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/Cart/RemoveFromCart/${productId}`);
  }
  
  /**
   * Svuota completamente carrello server
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.url}/Cart/Clear`);
  }
  
  // ========== MERGE CARRELLO LOCALE → SERVER ==========
  
  /**
   * Trasferisce carrello locale al DB dopo login
   * Chiamato automaticamente dal componente Auth
   * Esegue chiamate in sequenza (concatMap) per evitare race conditions
   */
  mergeLocalCartToServer(): Observable<void> {
    const localCart = this.getLocalCart();
    
    if (localCart.length === 0) {
      return of(void 0);
    }
    
    console.log('Merging local cart to server:', localCart);
    
    // from: converte array in Observable stream
    // concatMap: esegue chiamate in sequenza (aspetta che una finisca prima di iniziare la successiva)
    return from(localCart).pipe(
      concatMap(item => {
        console.log(`Adding product ${item.productId} with quantity ${item.quantity}`);
        return this.addToCart(item.productId, item.quantity);
      }),
      map(() => {
        console.log('All items added, clearing local cart');
        this.clearLocalCart();
      }),
      catchError(err => {
        console.error('Error merging cart:', err);
        throw err;
      })
    );
  }
  
  // ========== UTILITY METHODS ==========
  
  /**
   * Verifica se un prodotto è nel carrello
   * Controlla sia carrello locale che server
   */
  isInCart(productId: number): boolean {
    const cart = this.getLocalCart();
    return cart.some(item => item.productId === productId);
  }
  
  /**
   * Restituisce quantità di un prodotto nel carrello
   */
  itemCount(productId: number): number {
    const cart = this.getLocalCart();
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }
}
```

**Spiegazione:**
- **Dual Mode**: Gestisce automaticamente carrello locale (guest) o server (autenticati)
- **Merge Strategy**: Usa `concatMap` per eseguire chiamate in sequenza durante merge
- **Persistence**: Carrello locale sopravvive a refresh pagina grazie a localStorage
- **Signal Update**: Aggiorna signals automaticamente dopo ogni operazione

**Flow Merge Carrello:**
1. Guest aggiunge prodotti → localStorage
2. Guest fa login → `mergeLocalCartToServer()`
3. Ogni prodotto viene aggiunto al carrello DB
4. localStorage viene svuotato
5. Da ora in poi usa solo carrello DB

---

### 3. ProductService
**File:** `/src/app/shared/services/product.service.ts`

**Responsabilità:**
- Recupero prodotti (singolo, lista, search, random)
- Gestione categorie e modelli
- Paginazione e filtri

**Metodi Principali:**
```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  
  // GET singolo prodotto
  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.url}/Product/${id}`);
  }
  
  // GET lista prodotti con paginazione
  getProducts(page: number, pageSize: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.url}/Product?page=${page}&pageSize=${pageSize}`
    );
  }
  
  // Search prodotti per nome
  searchProducts(query: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.url}/Product/Search?query=${encodeURIComponent(query)}`
    );
  }
  
  // GET prodotti random per homepage
  getRandomProducts(count: number = 10): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.url}/Product/Random?count=${count}`
    );
  }
  
  // GET tutte le categorie
  getCategories(): Observable<ProductCategoryResponse[]> {
    return this.http.get<ProductCategoryResponse[]>(`${this.url}/Product/Categories`);
  }
  
  // GET prodotti per categoria
  getProductsByCategory(categoryId: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.url}/Product/Category/${categoryId}`
    );
  }
  
  // GET modelli prodotto
  getProductModels(): Observable<ProductModelsResponse[]> {
    return this.http.get<ProductModelsResponse[]>(`${this.url}/Product/Models`);
  }
}
```

**Spiegazione:**
- **RESTful API**: Tutte le chiamate seguono pattern REST
- **Query Params**: Usa query parameters per filtri e paginazione
- **Type Safety**: Ogni metodo ha tipo di ritorno specifico (ProductResponse, etc.)
- **Observable Pattern**: Tutti i metodi ritornano Observable per gestione asincrona

---

## Convenzioni Codice HTML

### 1. Naming
```html
<!-- Kebab-case per custom components -->
<app-navbar></app-navbar>

<!-- PascalCase per PrimeNG -->
<p-card></p-card>
```

### 2. Indentazione
- 2 spazi (no tabs)
- Attributi multipli su righe separate se > 3

### 3. Commenti
```html
<!-- Sezione Nome -->
<!-- FIXME: Issue da risolvere -->
<!-- TODO: Feature da implementare -->
```

### 4. Ordine Attributi
1. Structural directives (`*ngIf`, `*ngFor`)
2. Property bindings (`[property]`)
3. Event bindings (`(event)`)
4. Two-way binding (`[(ngModel)]`)
5. Static attributes
6. Styles/Classes

---

## Note Tecniche

### Signals vs Observables
- Utilizzare **Signals** per state management locale (UI state, computed values)
- Utilizzare **Observables** per stream asincroni (HTTP, eventi, websocket)

**Esempio Signal:**
```typescript
// Signal per UI state
loading = signal<boolean>(false);
products = signal<Product[]>([]);

// Computed signal (aggiornamento automatico)
totalPrice = computed(() => {
  return this.products().reduce((sum, p) => sum + p.price, 0);
});

// Update signal
this.loading.set(true);
this.products.update(current => [...current, newProduct]);
```

**Esempio Observable:**
```typescript
// Observable per HTTP
this.http.get<Product[]>('/api/products').subscribe({
  next: (data) => this.products.set(data),
  error: (err) => console.error(err)
});

// Observable per eventi
this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged()
  )
  .subscribe(value => this.search(value));
```

### Dependency Injection con inject()
```typescript
// Nuovo pattern (Angular 14+)
export class MyComponent {
  private service = inject(MyService);
  public authService = inject(AuthService);
}

// Vecchio pattern (ancora valido)
export class MyComponent {
  constructor(
    private service: MyService,
    public authService: AuthService
  ) {}
}
```

**Vantaggi inject():**
- Più conciso
- Supporta injection fuori dal constructor
- Migliore tree-shaking

### Lifecycle Hooks
```typescript
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    // Chiamato dopo creazione component
    // Inizializza data, subscribe to observables
    this.loadData();
  }
  
  ngOnDestroy(): void {
    // Chiamato prima di distruggere component
    // Cleanup: unsubscribe, clear timers
    this.subscription.unsubscribe();
  }
}
```

**Hooks Comuni:**
- `ngOnInit`: Inizializzazione (fetch data, setup)
- `ngOnDestroy`: Cleanup (unsubscribe, clear resources)
- `ngOnChanges`: Reagisce a cambiamenti @Input
- `ngAfterViewInit`: Dopo render completo della view

### Reactive Forms Best Practices
```typescript
// FormGroup con validatori
this.form = this.formBuilder.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  age: [null, [Validators.min(18), Validators.max(100)]]
});

// Check validità
if (this.form.valid) {
  const data = this.form.value;
  this.submit(data);
}

// Accesso a singolo control
const emailControl = this.form.get('email');
if (emailControl?.invalid && emailControl?.touched) {
  console.log('Email non valida');
}

// Reset form
this.form.reset();

// Set valori
this.form.patchValue({ email: 'test@test.com' });
```

### RxJS Operators Comuni
```typescript
// debounceTime: Attendi X ms dopo ultimo evento
searchControl.valueChanges.pipe(
  debounceTime(300),  // Aspetta 300ms
  distinctUntilChanged()  // Ignora valori duplicati
).subscribe(...)

// map: Trasforma dati
http.get<User>('/api/user').pipe(
  map(user => user.email)  // Estrai solo email
).subscribe(...)

// switchMap: Annulla richiesta precedente
searchControl.valueChanges.pipe(
  debounceTime(300),
  switchMap(query => http.get(`/search?q=${query}`))
).subscribe(...)

// forkJoin: Aspetta tutte le richieste
forkJoin({
  users: http.get('/users'),
  products: http.get('/products')
}).subscribe(({ users, products }) => {
  // Entrambe complete
})

// catchError: Gestisci errori
http.get('/api/data').pipe(
  catchError(err => {
    console.error(err);
    return of([]);  // Ritorna array vuoto come fallback
  })
).subscribe(...)
```

### Error Handling Pattern
```typescript
// Nel Service
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>('/api/products').pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching products:', error);
      
      // Logga errore in servizio esterno (Sentry, etc.)
      this.logError(error);
      
      // Ritorna array vuoto come fallback
      return of([]);
    })
  );
}

// Nel Component
loadProducts() {
  this.loading.set(true);
  
  this.productService.getProducts().subscribe({
    next: (data) => {
      this.products.set(data);
      this.loading.set(false);
    },
    error: (err) => {
      console.error('Component error:', err);
      this.error.set('Errore caricamento prodotti');
      this.loading.set(false);
      
      // Mostra toast error
      this.messageService.add({
        severity: 'error',
        summary: 'Errore',
        detail: 'Impossibile caricare i prodotti'
      });
    }
  });
}
```

### Type Safety con Models
```typescript
// Definisci interfacce per type safety
export interface Product {
  productId: number;
  name: string;
  price: number;
  thumbNailPhoto?: string;  // Optional
}

export interface CartResponse {
  products: Product[];
  totalElements: number;
  totalAmount: number;
}

// Usa nei component
products = signal<Product[]>([]);  // Type-safe signal
cart = signal<CartResponse | null>(null);

// HTTP con types
this.http.get<Product[]>('/api/products')  // TypeScript sa che è Product[]
  .subscribe(data => {
    // data è automaticamente Product[]
    this.products.set(data);
  });
```

### Computed Signals Pattern
```typescript
// Computed signal si aggiorna automaticamente quando dipendenze cambiano
export class CartComponent {
  cartItems = signal<CartItem[]>([]);
  
  // Si ricalcola automaticamente quando cartItems cambia
  totalItems = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });
  
  totalPrice = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });
  
  isEmpty = computed(() => this.cartItems().length === 0);
  
  // In template: {{ totalPrice() }}
}
```

### Angular Control Flow (@if, @for, @switch)
```typescript
// @if - Conditional rendering
@if (isLoading) {
  <p-progress-spinner />
} @else if (error) {
  <p-message severity="error">{{ error }}</p-message>
} @else {
  <div>{{ data }}</div>
}

// @for - Loop con tracking
@for (product of products(); track product.productId) {
  <p-card>{{ product.name }}</p-card>
} @empty {
  <p>Nessun prodotto</p>
}

// @switch - Multiple conditions
@switch (userRole) {
  @case (Role.Admin) {
    <admin-panel />
  }
  @case (Role.Customer) {
    <customer-panel />
  }
  @default {
    <guest-panel />
  }
}
```

**Vantaggi Control Flow vs *ngIf / *ngFor:**
- Migliori performance
- Type-safe (TypeScript checking)
- Sintassi più pulita
- Built-in empty state (@empty)
- Migliore tree-shaking

### PrimeNG Theming
- Theme definito in `angular.json`
- Custom styles in component CSS

### Tailwind Customization
- Configurato in `tailwind.config.js`
- Custom colors in theme extension

---

## Contatti e Risorse

**Documentazione Esterna:**
- [Angular Docs](https://angular.dev)
- [PrimeNG Components](https://primeng.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Material Icons](https://fonts.google.com/icons)

**Repository:** `/home/lorenzo/Scrivania/CicliLavarizia`

---

**Fine Documentazione**  
_Ultimo aggiornamento: 14 Gennaio 2026_
