import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { ProfileService, UserAddress, UserProfileData } from '../../services/profile/profile.service';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { PaymentService } from '../../../shared/services/Payment/payment.service';
import { formatApiError } from '../../../core/utils/error-handler';

type ProfileTab = 'overview' | 'addresses' | 'edit' | 'security';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly _ProfileService = inject(ProfileService);
  readonly _AuthService = inject(AuthService);
  private readonly _CartService = inject(CartService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _Toastr = inject(ToastrService);

  activeTab: ProfileTab = 'overview';
  isLoading = true;
  isUpdatingProfile = false;
  isSavingAddress = false;
  isChangingPassword = false;
  isDeletingAddressId: string | null = null;
  isAddAddressModalOpen = false;

  userProfile: UserProfileData | null = null;
  addresses: UserAddress[] = [];
  ordersCount = 0;
  wishlistCount = 0;
  cartCount = 0;

  showCurrentPassword = false;
  showNewPassword = false;
  showRePassword = false;

  // Forms
  editProfileForm: FormGroup = this._FormBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+2)?01[0125][0-9]{8}$/)]]
  });

  newAddressForm: FormGroup = this._FormBuilder.group({
    name: ['Home', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
    details: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+2)?01[0125][0-9]{8}$/)]],
    city: ['Cairo', [Validators.required]]
  });

  changePasswordForm: FormGroup = this._FormBuilder.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/)
    ]],
    rePassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  cities = [
    'Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Tanta',
    'Port Said', 'Suez', 'Ismailia', 'Assiut', 'Luxor',
    'Aswan', 'Hurghada', 'Sharm El Sheikh'
  ];

  ngOnInit(): void {
    this.loadProfileData();
    this.loadStats();
  }

  get userAvatar(): string {
    return this._AuthService.userAvatar;
  }

  get userInitials(): string {
    const name = this.userProfile?.name || this._AuthService.userName || 'Fresh User';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  get memberSince(): string {
    if (this.userProfile?.createdAt) {
      const date = new Date(this.userProfile.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return '2026';
  }

  get newPasswordVal(): string {
    return this.changePasswordForm.get('password')?.value || '';
  }

  get hasMinLength(): boolean {
    return this.newPasswordVal.length >= 8 && this.newPasswordVal.length <= 20;
  }
  get hasUpper(): boolean {
    return /[A-Z]/.test(this.newPasswordVal);
  }
  get hasLower(): boolean {
    return /[a-z]/.test(this.newPasswordVal);
  }
  get hasNumber(): boolean {
    return /\d/.test(this.newPasswordVal);
  }
  get hasSpecial(): boolean {
    return /[^a-zA-Z\d]/.test(this.newPasswordVal);
  }

  get passwordStrengthPercent(): number {
    let score = 0;
    if (this.hasMinLength) score += 20;
    if (this.hasUpper) score += 20;
    if (this.hasLower) score += 20;
    if (this.hasNumber) score += 20;
    if (this.hasSpecial) score += 20;
    return score;
  }

  get passwordStrengthLabel(): string {
    const p = this.passwordStrengthPercent;
    if (p === 0) return 'Enter a password';
    if (p <= 40) return 'Weak';
    if (p <= 60) return 'Moderate';
    if (p <= 80) return 'Good';
    return 'Strong & Secure';
  }

  get passwordStrengthColor(): string {
    const p = this.passwordStrengthPercent;
    if (p <= 40) return 'bg-rose-500 text-rose-600';
    if (p <= 60) return 'bg-amber-500 text-amber-600';
    if (p <= 80) return 'bg-teal-500 text-teal-600';
    return 'bg-emerald-500 text-emerald-600';
  }

  copiedId = false;

  copyAccountId(id?: string): void {
    if (!id) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copiedId = true;
        this._Toastr.info('Account ID copied to clipboard', 'Copied!', { timeOut: 2000 });
        setTimeout(() => this.copiedId = false, 2500);
      }).catch(() => {});
    }
  }

  setAddressLabelPreset(label: string): void {
    this.newAddressForm.patchValue({ name: label });
  }

  passwordMatchValidator(form: AbstractControl) {
    const pass = form.get('password')?.value;
    const rePass = form.get('rePassword')?.value;
    if (!pass || !rePass) return null;
    return pass === rePass ? null : { mismatch: true };
  }

  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
  }

  loadProfileData(): void {
    this.isLoading = true;
    this._ProfileService.getUserProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.data) {
          this.userProfile = res.data;
          this.addresses = res.data.addresses || [];
          this.editProfileForm.patchValue({
            name: res.data.name,
            phone: res.data.phone || ''
          });
        }
      },
      error: () => {
        this.isLoading = false;
        // Fallback to token information if API has momentary glitch
        this._AuthService.decodeToken();
        const info = this._AuthService.userInfo;
        if (info) {
          this.userProfile = {
            _id: info.id || '',
            name: info.name || '',
            email: info.email || '',
            role: info.role || 'user',
            addresses: []
          };
          this.editProfileForm.patchValue({
            name: info.name || ''
          });
        }
      }
    });
  }

  loadStats(): void {
    // 1. Wishlist count
    this._WishlistService.getUserWishlist(true).subscribe({
      next: (res: any) => {
        this.wishlistCount = res?.count || res?.data?.length || 0;
      },
      error: () => {}
    });

    // 2. Cart count
    this._CartService.GetLoggedUserCart(true).subscribe({
      next: (res: any) => {
        this.cartCount = res?.numOfCartItems || 0;
      },
      error: () => {}
    });

    // 3. Orders count
    this._AuthService.decodeToken();
    const userId = this._AuthService.userInfo?.id || this._AuthService.userInfo?._id;
    if (userId) {
      this._PaymentService.getUserOrders(userId).subscribe({
        next: (orders: any) => {
          this.ordersCount = Array.isArray(orders) ? orders.length : (orders?.data?.length || 0);
        },
        error: () => {}
      });
    }
  }

  onUpdateProfile(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile = true;
    const formVal = this.editProfileForm.value;
    this._ProfileService.updateUserProfile(formVal).subscribe({
      next: (_res: any) => {
        this.isUpdatingProfile = false;
        if (this.userProfile) {
          this.userProfile.name = formVal.name;
          this.userProfile.phone = formVal.phone;
        }
        this._Toastr.success('Your profile details have been updated successfully!', 'Profile Updated', {
          timeOut: 3000,
          closeButton: true,
          progressBar: true
        });
        this.activeTab = 'overview';
      },
      error: (err: any) => {
        this.isUpdatingProfile = false;
        const formatted = formatApiError(err, '/updateMe');
        this._Toastr.error(formatted.message, formatted.title);
      }
    });
  }

  openAddAddressModal(): void {
    this.newAddressForm.reset({
      name: 'Home',
      details: '',
      phone: this.userProfile?.phone || '',
      city: 'Cairo'
    });
    this.isAddAddressModalOpen = true;
  }

  closeAddAddressModal(): void {
    this.isAddAddressModalOpen = false;
  }

  onAddAddress(): void {
    if (this.newAddressForm.invalid) {
      this.newAddressForm.markAllAsTouched();
      return;
    }

    this.isSavingAddress = true;
    const addressData: UserAddress = this.newAddressForm.value;

    this._ProfileService.addAddress(addressData).subscribe({
      next: (res: any) => {
        this.isSavingAddress = false;
        this.isAddAddressModalOpen = false;
        if (res?.data) {
          this.addresses = res.data;
          if (this.userProfile) {
            this.userProfile.addresses = res.data;
          }
        }
        this._Toastr.success('New delivery address has been saved!', 'Address Added', {
          timeOut: 3000,
          closeButton: true,
          progressBar: true
        });
      },
      error: (err: any) => {
        this.isSavingAddress = false;
        const formatted = formatApiError(err, '/addresses');
        this._Toastr.error(formatted.message, formatted.title);
      }
    });
  }

  onDeleteAddress(addressId?: string): void {
    if (!addressId) return;

    this.isDeletingAddressId = addressId;
    this._ProfileService.deleteAddress(addressId).subscribe({
      next: (res: any) => {
        this.isDeletingAddressId = null;
        if (res?.data) {
          this.addresses = res.data;
          if (this.userProfile) {
            this.userProfile.addresses = res.data;
          }
        } else {
          this.addresses = this.addresses.filter(a => a._id !== addressId);
        }
        this._Toastr.success('Address removed from your address book.', 'Address Deleted', {
          timeOut: 2500,
          closeButton: true,
          progressBar: true
        });
      },
      error: (err: any) => {
        this.isDeletingAddressId = null;
        const formatted = formatApiError(err, '/addresses');
        this._Toastr.error(formatted.message, formatted.title);
      }
    });
  }

  onChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;
    const payload = this.changePasswordForm.value;
    this._ProfileService.changePassword(payload).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        this.changePasswordForm.reset();
        // RouteMisr returns a fresh token upon password change
        if (res?.token) {
          this._AuthService.handleSuccessfulAuth(res, this.userAvatar);
        }
        this._Toastr.success('Your password has been changed successfully!', 'Security Updated', {
          timeOut: 3500,
          closeButton: true,
          progressBar: true
        });
        this.activeTab = 'overview';
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        const formatted = formatApiError(err, '/changeMyPassword');
        this._Toastr.error(formatted.message, formatted.title);
      }
    });
  }
}
