import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  imports: [ReactiveFormsModule],
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  
  submitted = signal(false);
  loading = signal(false);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading.set(true);
      // Simulate API call
      setTimeout(() => {
        this.loading.set(false);
        this.submitted.set(true);
        this.contactForm.reset();
        
        setTimeout(() => this.submitted.set(false), 5000);
      }, 1500);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
