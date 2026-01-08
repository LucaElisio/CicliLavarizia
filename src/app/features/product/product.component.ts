import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ProductCategoryResponse, ProductResponse } from '../../shared/models/productModel';
import { ProductService } from '../../shared/services/product.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ProductModelsResponse } from '../../shared/models/productModelsResponse';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../shared/services/cart.service';
import { DataViewModule } from 'primeng/dataview';
import { PaginatorModule } from 'primeng/paginator';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    SliderModule,
    FormsModule,
    Slider,
    InputTextModule,
    ButtonModule,
    DataViewModule,
    PaginatorModule,
    ProgressBarModule
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  allProducts = signal<ProductResponse[]>([]);
  originalProducts = signal<ProductResponse[]>([]); // Prodotti originali non filtrati
  allCategories = signal<ProductCategoryResponse[]>([]);
  currentProduct: ProductResponse | null = null;

  originalModels = signal<ProductModelsResponse[]>([]);
  allProductModels = signal<ProductModelsResponse[]>([]);
  currentModel: ProductModelsResponse | null = null;
  selectedModel: ProductModelsResponse | null = null;
  filteredProducts = signal<ProductResponse[]>([]);

  // Traccia se stiamo visualizzando prodotti per categoria
  viewingByCategory: boolean = false;

  public cartService = inject(CartService);

  productCategory: string = 'All';
  currentPage: number = 1;
  pageSize: number = 21;
  hasNextPage: boolean = false;

  minPrice: number = 0;
  maxPrice: number = 9000;
  priceRange: number[] = [this.minPrice, this.maxPrice];

  loading = signal<boolean>(true); // stato di caricamento

  // Paginazione modelli
  modelsCurrentPage = signal<number>(0);
  modelsPerPage = signal<number>(9);

  // Signal computed per i modelli paginati
  paginatedModels = computed(() => {
    const start = this.modelsCurrentPage() * this.modelsPerPage();
    const end = start + this.modelsPerPage();
    return this.allProductModels().slice(start, end);
  });

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Legge la categoria dall'URL se presente
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.productCategory = params['category'];
        if (this.productCategory !== 'All') {
          this.viewingByCategory = true;
        }
      }
    });

    this.getProducts();
    this.getModels();
    this.getAllCategories();
  }
  getProducts(): void {
    this.loading.set(true);
    // Carica molti prodotti per avere prodotti di tutti i modelli
    const loadSize = 300;

    this.productService.getProducts(this.currentPage, loadSize, this.productCategory).subscribe({
      next: (data: any) => {
        this.originalProducts.set(data.products); // Salva i prodotti originali
        this.filterByPrice(); // Applica il filtro prezzo lato client
        this.hasNextPage = data.products.length === loadSize;
        this.loading.set(false);
        console.log('Prodotti caricati:', this.allProducts());
      },
      error: (err) => {
        console.error('Errore nella chiamata API:', err);
        this.loading.set(false);
      },
    });
  }

  getModels(): void {
    // Non impostiamo loading a true qui se stiamo solo caricando i modelli
    // perché i prodotti potrebbero già essere stati caricati
    const modelsLoadSize = 100;
    this.productService
      .getProductModels(this.currentPage, modelsLoadSize, this.productCategory)
      .subscribe({
        next: (data) => {
          this.originalModels.set(data);
          this.allProductModels.set(data);
          this.hasNextPage = data.length === modelsLoadSize;
          console.log('Modelli caricati:', this.allProductModels());
        },
        error: (err) => {
          console.error('Errore nella chiamata API per le descrizioni:', err);
        },
      });
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.getProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProducts();
    }
  }

  changeCategory(category: string): void {
    this.productCategory = category;
    this.currentPage = 1;
    this.selectedModel = null;

    // Aggiorna l'URL con la categoria selezionata
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category },
      queryParamsHandling: 'merge',
    });

    if (category === 'All') {
      // Se clicca su "Tutti i Prodotti", torna alla vista modelli
      this.viewingByCategory = false;
      this.loading.set(true);
      this.getModels();
      this.getProducts();
    } else {
      // Se clicca su una categoria specifica, mostra i prodotti di quella categoria
      this.viewingByCategory = true;
      this.getProducts();
    }
  }

  productInfo(product: ProductResponse): void {
    this.currentProduct = product;
  }

  getAllCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.allCategories.set(data);
        console.log('Categorie caricate:', this.allCategories);
      },
      error: (err) => {
        console.error('Errore nella chiamata API per le categorie:', err);
      },
    });
  }

  addToCart(productId: number, quantity: number = 1) {
    console.log(`Aggiungo al carrello il prodotto con ID: ${productId}, Quantità: ${quantity}`);
    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        this.cartService.getCart().subscribe({
          next: (data) => {
            this.cartService.cartProducts.set(data);
          },
        });
      },
    });
  }

  filterByPrice(): void {
    if (!this.selectedModel) {
      // Se non c'è un modello selezionato, filtriamo tutti i prodotti normalmente
      const filteredProducts = this.originalProducts().filter(
        (product) => product.listPrice >= this.minPrice && product.listPrice <= this.maxPrice
      );
      const limitedProducts = filteredProducts.slice(0, this.pageSize);
      this.allProducts.set(limitedProducts);
    } else {
      // Se c'è un modello selezionato, filtriamo dai prodotti originali
      const productsForModel = this.originalProducts().filter(
        (p) => p.productModelId === this.selectedModel!.productModelId
      );
      const filteredByPrice = productsForModel.filter(
        (product) => product.listPrice >= this.minPrice && product.listPrice <= this.maxPrice
      );
      const limitedProducts = filteredByPrice.slice(0, this.pageSize);
      this.filteredProducts.set(limitedProducts);
    }
  }

  selectModel(model: ProductModelsResponse): void {
    this.selectedModel = model;
    // Applica i filtri correnti al modello selezionato
    this.filterByPrice();
    console.log('Modello selezionato:', model);
    console.log('Prodotti filtrati:', this.filteredProducts());
  }

  backToModels(): void {
    this.selectedModel = null;
    this.filteredProducts.set([]);
    this.viewingByCategory = false;
    this.productCategory = 'All';

    // Aggiorna l'URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: 'All' },
      queryParamsHandling: 'merge',
    });

    // Reset dei filtri ai valori di default
    this.minPrice = 0;
    this.maxPrice = 9000;
    this.priceRange = [this.minPrice, this.maxPrice];
    this.pageSize = 21;
    // Ricarica i modelli
    this.getModels();
    this.getProducts();
  }

  onPageSizeChange(): void {
    if (!this.selectedModel) {
      // Se siamo nella vista modelli, ricarica i modelli
      this.getModels();
      this.getProducts();
    } else {
      // Se c'è un modello selezionato, applica solo i filtri senza ricaricare
      this.filterByPrice();
    }
  }

  onModelsPageChange(event: any): void {
    this.modelsCurrentPage.set(event.page);
    this.modelsPerPage.set(event.rows);
  }
}
