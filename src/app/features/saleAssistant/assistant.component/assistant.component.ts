import { Component, inject, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { SaleService } from '../../../shared/services/salesAssistant.service';
import { ProductComponent } from '../../product/product.component';
import { ProductResponse, ProductCategoryResponse } from '../../../shared/models/productModel';
import { ProductModelsResponse } from '../../../shared/models/productModelsResponse';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ProductService } from '../../../shared/services/product.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProductDiscount } from '../../../shared/models/discountModel';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-assistant.component',
  imports: [
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    FormsModule,
    CommonModule,
    SelectModule,
    TableModule,
    DialogModule,
    DatePickerModule,
    TooltipModule,
    MultiSelectModule,
  ],
  providers: [MessageService],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',
})
export class AssistantComponent implements OnInit {
  private saleService = inject(SaleService);
  private messageService = inject(MessageService);
  private productService = inject(ProductService);
  private elementRef = inject(ElementRef);

  categories = signal<ProductCategoryResponse[]>([]);
  models = signal<ProductModelsResponse[]>([]);
  discounts = signal<ProductDiscount[]>([]);
  products = signal<ProductResponse[]>([]);

  // Gestione dialogs
  displayCategoryDialog = false;
  displayCategoryUpdateDialog = false;
  displayModelDialog = false;
  displayDiscountDialog = false;
  displayProductUpdateDialog = false;
  displayModelDescriptionDialog = false;

  // Sezione attiva
  activeSection: 'product' | 'category' | 'model' | 'discount' = 'product';

  selectedModelForDescription: ProductModelsResponse | null = null;

  // Ricerca prodotti per discount - ORA CON SIGNAL
  productSearchTerm = '';
  searchedProducts = signal<ProductResponse[]>([]);
  selectedProducts = signal<ProductResponse[]>([]);
  private searchSubject = new Subject<string>();

  newProduct = {
    productId: 0,
    name: '',
    productNumber: '',
    color: '',
    standardCost: 0,
    listPrice: 0,
    size: '',
    weight: 0,
    productCategoryId: 0,
    productModelId: 0,
    sellStartDate: null as Date | null,
    thumbNailPhoto: '',
    thumbnailPhotoFileName: '',
  };

  newCategory = {
    productCategoryId: 0,
    name: '',
  };

  selectedCategory: ProductCategoryResponse | null = null;

  newModel = {
    productModelId: 0,
    name: '',
    modelDescription: '',
  };

  newDiscount: ProductDiscount = {
    productDiscountId: 0,
    code: '',
    percentage: 0,
    startDate: '',
    endDate: '',
    productId: [],
    productCategoryId: [],
  };

  selectedProduct: any = null;

  ngOnInit(): void {
    this.loadCategories();
    this.loadModels();
    this.loadDiscounts();
    this.loadProducts();
    this.setupProductSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Trova il campo di ricerca e la lista dei risultati
    const searchInput = this.elementRef.nativeElement.querySelector(
      'input[placeholder="Cerca prodotto per nome..."]'
    );
    const searchResults = this.elementRef.nativeElement.querySelector('[style*="position: fixed"]');

    // Controlla se il click è dentro il campo di ricerca o la lista risultati
    const clickedInsideSearch = searchInput?.contains(target);
    const clickedInsideResults = searchResults?.contains(target);

    // Se il click è fuori da entrambi e ci sono risultati visibili, chiudi
    if (!clickedInsideSearch && !clickedInsideResults && this.searchedProducts().length > 0) {
      this.searchedProducts.set([]);
      this.productSearchTerm = '';
    }
  }

  loadProducts(): void {
    this.productService.getProducts(1, 1000, 'All').subscribe({
      next: (data) => {
        this.products.set(data.products);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento dei prodotti:', err);
      },
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data: ProductCategoryResponse[]) => {
        this.categories.set(data);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento delle categorie:', err);
      },
    });
  }

  loadModels(): void {
    this.productService.getProductModels(1, 1000, 'All').subscribe({
      next: (data: ProductModelsResponse[]) => {
        this.models.set(data);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento dei modelli:', err);
      },
    });
  }

  //Gestione prodotti
  InsertProduct() {
    // Validazione campi obbligatori
    if (
      !this.newProduct.name ||
      !this.newProduct.productNumber ||
      !this.newProduct.productCategoryId ||
      !this.newProduct.sellStartDate
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campi obbligatori mancanti',
        detail:
          'Compila tutti i campi obbligatori (Nome, Numero Prodotto, Categoria, Data Inizio Vendita)',
        life: 5000,
      });
      return;
    }

    console.log('Sending product data:', JSON.stringify(this.newProduct, null, 2));

    const productData = {
      ...this.newProduct,
      sellStartDate: this.newProduct.sellStartDate
        ? this.newProduct.sellStartDate.toISOString()
        : new Date().toISOString(),
    };

    console.log('Product data with converted date:', JSON.stringify(productData, null, 2));
    this.saleService.insertProduct(productData as any).subscribe({
      next: (data) => {
        console.log('Prodotto inserito con successo:', data);
        this.messageService.add({
          severity: 'success',
          summary: 'Prodotto inserito',
          detail: 'Il prodotto è stato inserito con successo',
          life: 3000,
        });
        this.resetForm();
        this.loadProducts(); // Aggiorna automaticamente la lista prodotti
      },
      error: (err) => {
        console.error("Errore durante l'inserimento del prodotto:", err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile inserire il prodotto',
          life: 5000,
        });
      },
    });
  }

  resetForm(): void {
    this.newProduct = {
      productId: 0,
      name: '',
      productNumber: '',
      color: '',
      standardCost: 0,
      listPrice: 0,
      size: '',
      weight: 0,
      productCategoryId: 0,
      productModelId: 0,
      sellStartDate: null as Date | null,
      thumbNailPhoto: '',
      thumbnailPhotoFileName: '',
    };
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validazione dimensione file (max 500KB per evitare header troppo grandi)
      const maxSizeKB = 500;
      const fileSizeKB = file.size / 1024;

      if (fileSizeKB > maxSizeKB) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Immagine troppo grande',
          detail: `La dimensione dell'immagine deve essere inferiore a ${maxSizeKB}KB. Dimensione attuale: ${fileSizeKB.toFixed(
            0
          )}KB`,
          life: 5000,
        });
        return;
      }

      this.newProduct.thumbnailPhotoFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);

        // Converti in stringa esadecimale
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
          const hexByte = bytes[i].toString(16).padStart(2, '0');
          hex += hexByte;
        }

        this.newProduct.thumbNailPhoto = hex;
        console.log('Image converted to hex, length:', hex.length);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  onUpdateFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validazione dimensione file (max 500KB per evitare header troppo grandi)
      const maxSizeKB = 500;
      const fileSizeKB = file.size / 1024;

      if (fileSizeKB > maxSizeKB) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Immagine troppo grande',
          detail: `La dimensione dell'immagine deve essere inferiore a ${maxSizeKB}KB. Dimensione attuale: ${fileSizeKB.toFixed(
            0
          )}KB`,
          life: 5000,
        });
        // Reset input file
        event.target.value = '';
        return;
      }

      this.selectedProduct.thumbnailPhotoFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);

        // Converti in stringa esadecimale
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
          const hexByte = bytes[i].toString(16).padStart(2, '0');
          hex += hexByte;
        }

        this.selectedProduct.thumbNailPhoto = hex;
        console.log('Update image converted to hex, length:', hex.length);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  removeSingleProduct(productId: number): void {
    this.saleService.removeSingleProduct(productId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Prodotto rimosso',
          detail: 'Il prodotto è stato eliminato con successo',
          life: 3000,
        });
        this.loadProducts();
      },
      error: (err) => {
        console.error('Errore rimozione prodotto:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore eliminazione prodotto',
          life: 5000,
        });
      },
    });
  }

  isProductUpdateValid(): boolean {
    if (!this.selectedProduct) return false;

    return !!(
      this.selectedProduct.name &&
      this.selectedProduct.productNumber &&
      this.selectedProduct.listPrice > 0 &&
      this.selectedProduct.standardCost > 0 &&
      this.selectedProduct.productCategoryId &&
      this.selectedProduct.sellStartDate
    );
  }

  updateProduct(productId: number): void {
    // Converti la data in formato ISO string se è un oggetto Date
    const sellStartDate =
      this.selectedProduct.sellStartDate instanceof Date
        ? this.selectedProduct.sellStartDate.toISOString()
        : this.selectedProduct.sellStartDate;

    const productData = {
      ...this.selectedProduct,
      sellStartDate: sellStartDate,
    };

    this.saleService.updateProduct(this.selectedProduct.productId, productData as any).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Prodotto aggiornato',
          life: 3000,
        });
        this.displayProductUpdateDialog = false;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Errore aggiornamento prodotto:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore aggiornamento prodotto',
          life: 5000,
        });
      },
    });
  }

  openProductUpdateDialog(product: ProductResponse): void {
    this.selectedProduct = { ...product };
    this.displayProductUpdateDialog = true;
  }

  // === CATEGORIE ===
  openCategoryDialog(): void {
    this.newCategory = { productCategoryId: 0, name: '' };
    this.displayCategoryDialog = true;
  }

  insertCategory(): void {
    if (!this.newCategory.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome categoria obbligatorio',
        life: 3000,
      });
      return;
    }

    this.saleService.insertCategory(this.newCategory as ProductCategoryResponse).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Categoria inserita', life: 3000 });
        this.displayCategoryDialog = false;
        this.loadCategories();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Errore inserimento categoria',
          life: 5000,
        }),
    });
  }

  deleteCategory(categoryId: number): void {
    this.saleService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Categoria eliminata',
          life: 3000,
        });
        this.loadCategories();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Errore eliminazione categoria',
          life: 5000,
        }),
    });
  }

  openCategoryUpdateDialog(category: ProductCategoryResponse): void {
    this.selectedCategory = { ...category };
    this.displayCategoryUpdateDialog = true;
  }

  updateCategory(): void {
    if (!this.selectedCategory || !this.selectedCategory.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome categoria obbligatorio',
        life: 3000,
      });
      return;
    }

    this.saleService
      .updateCategory(this.selectedCategory.productCategoryId, this.selectedCategory.name)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Categoria aggiornata',
            life: 3000,
          });
          this.displayCategoryUpdateDialog = false;
          this.loadCategories();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Errore aggiornamento categoria',
            life: 5000,
          }),
      });
  }

  // === MODELLI ===
  openModelDialog(): void {
    this.newModel = { productModelId: 0, name: '', modelDescription: '' };
    this.displayModelDialog = true;
  }

  insertModel(): void {
    if (!this.newModel.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome modello obbligatorio',
        life: 3000,
      });
      return;
    }

    console.log('Sending model data:', JSON.stringify(this.newModel, null, 2));
    this.saleService.insertProductModel(this.newModel).subscribe({
      next: (response) => {
        console.log('Model inserted successfully:', response);
        this.messageService.add({ severity: 'success', summary: 'Modello inserito', life: 3000 });
        this.displayModelDialog = false;
        this.loadModels();
      },
      error: (err) => {
        console.error('Errore inserimento modello:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore inserimento modello',
          life: 5000,
        });
      },
    });
  }

  deleteModel(modelId: number): void {
    this.saleService.deleteProductModel(modelId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Modello eliminato', life: 3000 });
        this.loadModels();
        this.loadProducts(); // Aggiorna anche la lista prodotti
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Errore eliminazione modello',
          life: 5000,
        }),
    });
  }

  openModelDescriptionDialog(model: ProductModelsResponse): void {
    this.selectedModelForDescription = { ...model };
    this.displayModelDescriptionDialog = true;
  }

  updateModelDescription(): void {
    if (!this.selectedModelForDescription || !this.selectedModelForDescription.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome modello obbligatorio',
        life: 3000,
      });
      return;
    }

    console.log('Updating model:', this.selectedModelForDescription.productModelId);
    console.log('New name:', this.selectedModelForDescription.name);
    console.log('New description:', this.selectedModelForDescription.modelDescription);

    // Prima aggiorna il nome
    this.saleService
      .updateProductModel(
        this.selectedModelForDescription.productModelId,
        this.selectedModelForDescription.name
      )
      .subscribe({
        next: () => {
          // Poi aggiorna la descrizione
          this.saleService
            .updateProductDescription(
              this.selectedModelForDescription!.name,
              this.selectedModelForDescription!.modelDescription
            )
            .subscribe({
              next: () => {
                console.log('Model updated successfully');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Modello aggiornato',
                  life: 3000,
                });
                this.displayModelDescriptionDialog = false;
                this.loadModels();
              },
              error: (err) => {
                console.error('Errore aggiornamento descrizione:', err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Errore aggiornamento descrizione',
                  life: 5000,
                });
              },
            });
        },
        error: (err) => {
          console.error('Errore aggiornamento nome:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Errore aggiornamento nome',
            life: 5000,
          });
        },
      });
  }

  // === SCONTI ===
  loadDiscounts(): void {
    this.saleService.getDiscounts().subscribe({
      next: (data: ProductDiscount[]) => this.discounts.set(data),
      error: (err: any) => console.error('Errore caricamento sconti:', err),
    });
  }

  setupProductSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term && term.length >= 2) {
            return this.productService.searchProduct(term);
          }
          return [];
        })
      )
      .subscribe({
        next: (products) => {
          // Filtra i prodotti già selezionati
          const filtered = products.filter(
            (p) => !this.selectedProducts().some((sp) => sp.productId === p.productId)
          );
          this.searchedProducts.set(filtered);
        },
        error: (error) => {
          console.error('Errore nella ricerca prodotti:', error);
          this.searchedProducts.set([]);
        },
      });
  }

  onProductSearch(): void {
    this.searchSubject.next(this.productSearchTerm);
  }

  addProduct(product: ProductResponse): void {
    if (!this.selectedProducts().some((p) => p.productId === product.productId)) {
      this.selectedProducts.update((products) => [...products, product]);
      // Rimuovi dai risultati di ricerca
      this.searchedProducts.update((products) =>
        products.filter((p) => p.productId !== product.productId)
      );
      // Pulisci il campo di ricerca
      this.productSearchTerm = '';
    }
  }

  removeProduct(productId: number): void {
    this.selectedProducts.update((products) => products.filter((p) => p.productId !== productId));
  }

  openDiscountDialog(): void {
    this.newDiscount = {
      productDiscountId: 0,
      code: '',
      percentage: 0,
      startDate: '',
      endDate: '',
      productId: [],
      productCategoryId: [],
    };
    this.selectedProducts.set([]);
    this.searchedProducts.set([]);
    this.productSearchTerm = '';
    this.displayDiscountDialog = true;
  }

  insertDiscount(): void {
    // Validazione campi obbligatori
    if (!this.newDiscount.code || !this.newDiscount.percentage) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campi obbligatori mancanti',
        detail: 'Inserisci codice e percentuale',
        life: 3000,
      });
      return;
    }

    // Popola l'array di productId con i prodotti selezionati
    this.newDiscount.productId = this.selectedProducts().map((p) => p.productId);

    // Validazione: almeno una categoria o un prodotto deve essere selezionato
    if (
      this.newDiscount.productId.length === 0 &&
      this.newDiscount.productCategoryId.length === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selezione richiesta',
        detail: 'Seleziona almeno una categoria o un prodotto',
        life: 3000,
      });
      return;
    }

    // Converti le date se necessario
    if (this.newDiscount.startDate) {
      this.newDiscount.startDate = this.formatDate(this.newDiscount.startDate);
    }
    if (this.newDiscount.endDate) {
      this.newDiscount.endDate = this.formatDate(this.newDiscount.endDate);
    }

    console.log('Sconto da inserire:', this.newDiscount);

    this.saleService.insertDiscount(this.newDiscount).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sconto inserito', life: 3000 });
        this.displayDiscountDialog = false;
        this.loadDiscounts();
        this.resetDiscountForm();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Errore inserimento sconto',
          life: 5000,
        }),
    });
  }

  resetDiscountForm(): void {
    this.newDiscount = {
      productDiscountId: 0,
      code: '',
      percentage: 0,
      startDate: '',
      endDate: '',
      productId: [],
      productCategoryId: [],
    };
    this.selectedProducts.set([]);
    this.searchedProducts.set([]);
    this.productSearchTerm = '';
  }

  private formatDate(date: any): string {
    if (date instanceof Date) {
      // Usa toLocaleDateString per ottenere la data locale in formato ISO
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  deleteDiscount(discountId: number): void {
    this.saleService.deleteDiscount(discountId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sconto eliminato', life: 3000 });
        this.loadDiscounts();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Errore eliminazione sconto',
          life: 5000,
        }),
    });
  }

  // === SWITCH SEZIONE ===
  setActiveSection(section: 'product' | 'category' | 'model' | 'discount'): void {
    this.activeSection = section;
  }

  // Metodo helper per ottenere il nome della categoria dall'ID
  getCategoryName(categoryId: number): string {
    const category = this.categories().find((c) => c.productCategoryId === categoryId);
    return category ? category.name : 'N/A';
  }

  // Metodo helper per ottenere il nome del modello dall'ID
  getModelName(modelId: number | undefined): string {
    if (!modelId) return '-';
    const model = this.models().find((m) => m.productModelId === modelId);
    return model ? model.name : '-';
  }
}
