import { Component, inject, signal, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-assistant.component',
  imports: [CardModule, InputTextModule, InputNumberModule, ButtonModule, ToastModule, FormsModule, CommonModule, SelectModule, TableModule, DialogModule, DatePickerModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',
})


export class AssistantComponent implements OnInit {

  private saleService = inject(SaleService);
  private messageService = inject(MessageService);
  private productService = inject(ProductService);

  categories = signal<ProductCategoryResponse[]>([]);
  models = signal<ProductModelsResponse[]>([]);
  discounts = signal<ProductDiscount[]>([]);
  products = signal<ProductResponse[]>([]);

  // Gestione dialogs
  displayCategoryDialog = false;
  displayModelDialog = false;
  displayDiscountDialog = false;
  displayProductUpdateDialog = false;
  displayModelDescriptionDialog = false;

  // Sezione attiva
  activeSection: 'product' | 'category' | 'model' | 'discount' = 'product';

  selectedModelForDescription: ProductModelsResponse | null = null;

  newProduct = {
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
    thumbnailPhotoFileName: ''
  };

  newCategory = {
    productCategoryId: 0,
    name: ''
  };

  newModel = {
    productModelId: 0,
    name: '',
    modelDescription: ''
  };

  newDiscount: ProductDiscount = {
    productDiscountId: 0,
    code: '',
    percentage: 0,
    startDate: '',
    endDate: '',
    productId: [],
    productCategoryId: []
  };

  selectedProduct: any = null;

  ngOnInit(): void {
    this.loadCategories();
    this.loadModels();
    this.loadDiscounts();
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts(1, 1000, 'All').subscribe({
      next: (data) => {
        this.products.set(data.products);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento dei prodotti:', err);
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data: ProductCategoryResponse[]) => {
        this.categories.set(data);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento delle categorie:', err);
      }
    });
  }

  loadModels(): void {
    this.productService.getProductModels(1, 1000, 'All').subscribe({
      next: (data: ProductModelsResponse[]) => {
        this.models.set(data);
      },
      error: (err: any) => {
        console.error('Errore nel caricamento dei modelli:', err);
      }
    });
  }
  
  //Gestione prodotti
  InsertProduct() {
    // Validazione campi obbligatori
    if (!this.newProduct.name || !this.newProduct.productNumber || !this.newProduct.productCategoryId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campi obbligatori mancanti',
        detail: 'Compila tutti i campi obbligatori (Nome, Numero Prodotto, Categoria)',
        life: 5000
      });
      return;
    }

    console.log('Sending product data:', JSON.stringify(this.newProduct, null, 2));
    
    const productData = {
      ...this.newProduct,
      sellStartDate: this.newProduct.sellStartDate ? this.newProduct.sellStartDate.toISOString() : new Date().toISOString()
    };
    
    console.log('Product data with converted date:', JSON.stringify(productData, null, 2));
    this.saleService.insertProduct(productData as any).subscribe({
      next: (data) => {
        console.log('Prodotto inserito con successo:', data);
        this.messageService.add({
          severity: 'success',
          summary: 'Prodotto inserito',
          detail: 'Il prodotto è stato inserito con successo',
          life: 3000
        });
        this.resetForm();
      },
      error: (err) => {
        console.error('Errore durante l\'inserimento del prodotto:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile inserire il prodotto',
          life: 5000
        });
      },
    });
  }

  resetForm(): void {
    this.newProduct = {
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
      thumbnailPhotoFileName: ''
    };
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
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

  removeSingleProduct(productId: number): void {
    this.saleService.removeSingleProduct(productId).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Prodotto rimosso', 
          detail: 'Il prodotto è stato eliminato con successo',
          life: 3000 
        });
        this.loadProducts();
      },
      error: (err) => {
        console.error('Errore rimozione prodotto:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Errore eliminazione prodotto', 
          life: 5000 
        });
      }
    });
  }

  removeAllProducts(productNumber: string): void {
    this.saleService.removeAllProducts(productNumber).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Prodotti rimossi', 
          detail: `Tutti i prodotti con numero ${productNumber} sono stati eliminati`,
          life: 3000 
        });
        this.loadProducts();
      },
      error: (err) => {
        console.error('Errore rimozione prodotti:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Errore eliminazione prodotti', 
          life: 5000 
        });
      }
    });
  }

  // === CATEGORIE ===
  openCategoryDialog(): void {
    this.newCategory = { productCategoryId: 0, name: '' };
    this.displayCategoryDialog = true;
  }

  insertCategory(): void {
    if (!this.newCategory.name) {
      this.messageService.add({ severity: 'warn', summary: 'Nome categoria obbligatorio', life: 3000 });
      return;
    }

    this.saleService.insertCategory(this.newCategory as ProductCategoryResponse).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Categoria inserita', life: 3000 });
        this.displayCategoryDialog = false;
        this.loadCategories();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Errore inserimento categoria', life: 5000 })
    });
  }

  deleteCategory(categoryId: number): void {
    this.saleService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Categoria eliminata', life: 3000 });
        this.loadCategories();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Errore eliminazione categoria', life: 5000 })
    });
  }

  // === MODELLI ===
  openModelDialog(): void {
    this.newModel = { productModelId: 0, name: '', modelDescription: '' };
    this.displayModelDialog = true;
  }

  insertModel(): void {
    if (!this.newModel.name) {
      this.messageService.add({ severity: 'warn', summary: 'Nome modello obbligatorio', life: 3000 });
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
        this.messageService.add({ severity: 'error', summary: 'Errore inserimento modello', life: 5000 });
      }
    });
  }

  deleteModel(modelId: number): void {
    this.saleService.deleteProductModel(modelId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Modello eliminato', life: 3000 });
        this.loadModels();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Errore eliminazione modello', life: 5000 })
    });
  }

  openModelDescriptionDialog(model: ProductModelsResponse): void {
    this.selectedModelForDescription = { ...model };
    this.displayModelDescriptionDialog = true;
  }

  updateModelDescription(): void {
    if (!this.selectedModelForDescription || !this.selectedModelForDescription.name) {
      this.messageService.add({ severity: 'error', summary: 'Nome modello mancante', life: 5000 });
      return;
    }

    console.log('Updating description for model:', this.selectedModelForDescription.name);
    console.log('New description:', this.selectedModelForDescription.modelDescription);

    this.saleService.updateProductDescription(
      this.selectedModelForDescription.name,
      this.selectedModelForDescription.modelDescription
    ).subscribe({
      next: (response) => {
        console.log('Description updated successfully:', response);
        this.messageService.add({ severity: 'success', summary: 'Descrizione aggiornata', life: 3000 });
        this.displayModelDescriptionDialog = false;
        this.loadModels();
      },
      error: (err) => {
        console.error('Errore aggiornamento descrizione:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        this.messageService.add({ severity: 'error', summary: 'Errore aggiornamento descrizione', life: 5000 });
      }
    });
  }

  // === SCONTI ===
  loadDiscounts(): void {
    this.saleService.getDiscounts().subscribe({
      next: (data: ProductDiscount[]) => this.discounts.set(data),
      error: (err: any) => console.error('Errore caricamento sconti:', err)
    });
  }

  openDiscountDialog(): void {
    this.newDiscount = {
      productDiscountId: 0,
      code: '',
      percentage: 0,
      startDate: '',
      endDate: '',
      productId: [],
      productCategoryId: []
    };
    this.displayDiscountDialog = true;
  }

  insertDiscount(): void {
    if (!this.newDiscount.code || !this.newDiscount.percentage) {
      this.messageService.add({ severity: 'warn', summary: 'Codice e percentuale obbligatori', life: 3000 });
      return;
    }

    this.saleService.insertDiscount(this.newDiscount).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sconto inserito', life: 3000 });
        this.displayDiscountDialog = false;
        this.loadDiscounts();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Errore inserimento sconto', life: 5000 })
    });
  }

  deleteDiscount(discountId: number): void {
    this.saleService.deleteDiscount(discountId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sconto eliminato', life: 3000 });
        this.loadDiscounts();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Errore eliminazione sconto', life: 5000 })
    });
  }

  // === SWITCH SEZIONE ===
  setActiveSection(section: 'product' | 'category' | 'model' | 'discount'): void {
    this.activeSection = section;
  }

  // Metodo helper per ottenere il nome della categoria dall'ID
  getCategoryName(categoryId: number): string {
    const category = this.categories().find(c => c.productCategoryId === categoryId);
    return category ? category.name : 'N/A';
  }
}
