import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { ProfileService, UserAddress, UserProfileData } from '../../services/profile/profile.service';
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
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _Toastr = inject(ToastrService);

  activeTab: ProfileTab = 'overview';
  isLoading = true;
  isUpdatingProfile = false;
  isSavingAddress = false;
  isChangingPassword = false;
  isDeletingAddressId: string | null = null;
  isAddAddressModalOpen = false;

  // GPS Geolocation state
  isDetectingLocation = false;
  locationError: string | null = null;

  // Feedback alerts
  passwordErrorMessage: string | null = null;
  passwordSuccessMessage: string | null = null;
  profileErrorMessage: string | null = null;
  profileSuccessMessage: string | null = null;

  userProfile: UserProfileData | null = null;
  addresses: UserAddress[] = [];

  // Password visibility controls matching Login/Register pattern
  showCurrentPassword = false;
  showNewPassword = false;
  showRePassword = false;

  // Forms
  editProfileForm: FormGroup = this._FormBuilder.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
      Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    ]],
    phone: ['', [
      Validators.required,
      Validators.pattern(/^(\+2)?01[0125][0-9]{8}$/)
    ]]
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
  }

  // Getters for template bindings
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

  // Form controls getters
  get editNameControl() { return this.editProfileForm.get('name'); }
  get editPhoneControl() { return this.editProfileForm.get('phone'); }

  get currentPasswordControl() { return this.changePasswordForm.get('currentPassword'); }
  get newPasswordControl() { return this.changePasswordForm.get('password'); }
  get rePasswordControl() { return this.changePasswordForm.get('rePassword'); }

  get addressNameControl() { return this.newAddressForm.get('name'); }
  get addressDetailsControl() { return this.newAddressForm.get('details'); }
  get addressPhoneControl() { return this.newAddressForm.get('phone'); }
  get addressCityControl() { return this.newAddressForm.get('city'); }

  // Password validation criteria (exact match with RegisterComponent)
  get newPasswordVal(): string {
    return this.newPasswordControl?.value || '';
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

  // Password visibility toggles
  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleRePassword(): void {
    this.showRePassword = !this.showRePassword;
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const rePassword = form.get('rePassword')?.value;
    if (!password || !rePassword) return null;
    return password === rePassword ? null : { missMatch: true };
  }

  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
    this.passwordErrorMessage = null;
    this.passwordSuccessMessage = null;
    this.profileErrorMessage = null;
    this.profileSuccessMessage = null;
    this.locationError = null;
  }

  setAddressLabelPreset(label: string): void {
    this.newAddressForm.patchValue({ name: label });
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

  onUpdateProfile(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile = true;
    this.profileErrorMessage = null;
    this.profileSuccessMessage = null;

    const formVal = this.editProfileForm.value;
    this._ProfileService.updateUserProfile(formVal).subscribe({
      next: (_res: any) => {
        this.isUpdatingProfile = false;
        if (this.userProfile) {
          this.userProfile.name = formVal.name;
          this.userProfile.phone = formVal.phone;
        }
        this.profileSuccessMessage = 'Your profile details have been updated successfully.';
        this._Toastr.success('Profile updated successfully!', 'Success');
        setTimeout(() => {
          this.activeTab = 'overview';
        }, 1200);
      },
      error: (err: any) => {
        this.isUpdatingProfile = false;
        const formatted = formatApiError(err, '/updateMe');
        this.profileErrorMessage = formatted.message;
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
    this.locationError = null;
    this.isDetectingLocation = false;
    this.isAddAddressModalOpen = true;
  }

  closeAddAddressModal(): void {
    this.isAddAddressModalOpen = false;
    this.locationError = null;
    this.isDetectingLocation = false;
  }

  // GPS & Network Geolocation Support
  useCurrentLocation(): void {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      this.detectLocationByIp();
      return;
    }

    this.isDetectingLocation = true;
    this.locationError = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.reverseGeocode(latitude, longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.isDetectingLocation = false;
          this.locationError = 'Location access was denied. You can enter your address details manually below.';
          return;
        }
        // If timeout or hardware unavailable (common on PCs/laptops without GPS chip), seamlessly fallback to IP location
        this.detectLocationByIp();
      },
      // enableHighAccuracy: false ensures standard Wi-Fi/IP location without waiting for non-existent GPS chips
      { timeout: 7000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }

  private detectLocationByIp(): void {
    this.isDetectingLocation = true;
    fetch('https://ipwho.is/')
      .then((res) => {
        if (!res.ok) throw new Error('IP service error');
        return res.json();
      })
      .then((data) => {
        if (!data || !data.success) throw new Error('IP lookup failed');

        if (data.latitude && data.longitude) {
          this.reverseGeocode(data.latitude, data.longitude, true);
        } else {
          this.isDetectingLocation = false;
          const detectedCity = this.matchCity(data.city || data.region || '');
          if (detectedCity) {
            this.newAddressForm.patchValue({ city: detectedCity });
          }
          this._Toastr.info('City detected from network. Please enter your street address details.', 'Location Detected');
        }
      })
      .catch(() => {
        this.isDetectingLocation = false;
        this.locationError = 'Could not detect your location automatically. Please enter your address details manually.';
      });
  }

  private reverseGeocode(lat: number, lon: number, isFallback = false): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    fetch(url, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error('Geocoding service unavailable');
        return res.json();
      })
      .then((data) => {
        this.isDetectingLocation = false;
        const addr = data?.address || {};

        const streetParts = [
          addr.house_number,
          addr.road,
          addr.suburb || addr.neighbourhood || addr.quarter,
          addr.city_district
        ].filter(Boolean);

        const readableDetails = streetParts.length > 0
          ? streetParts.join(', ')
          : (data?.display_name?.split(',').slice(0, 3).join(', ') || '');

        if (readableDetails) {
          this.newAddressForm.patchValue({ details: readableDetails });
        }

        const rawCity = addr.city || addr.state || addr.governorate || addr.town || addr.county || '';
        const matchedCity = this.matchCity(rawCity);
        if (matchedCity) {
          this.newAddressForm.patchValue({ city: matchedCity });
        }

        const msg = isFallback
          ? 'Approximate location detected via network. Please review your street details.'
          : 'Detected location details filled. Please review and adjust before saving.';
        this._Toastr.info(msg, 'Location Detected');
      })
      .catch(() => {
        this.isDetectingLocation = false;
        this.locationError = 'Could not lookup exact street address. Please enter details manually.';
      });
  }

  private matchCity(cityName: string): string | null {
    if (!cityName) return null;
    const lower = cityName.toLowerCase();

    // 1. Direct english match
    const direct = this.cities.find((c) => lower.includes(c.toLowerCase()));
    if (direct) return direct;

    // 2. Arabic name mappings
    const arabicMap: { [key: string]: string } = {
      'قاهرة': 'Cairo',
      'جيزة': 'Giza',
      'إسكندرية': 'Alexandria',
      'اسكندرية': 'Alexandria',
      'منصورة': 'Mansoura',
      'طنطا': 'Tanta',
      'بورسعيد': 'Port Said',
      'سويس': 'Suez',
      'إسماعيلية': 'Ismailia',
      'اسماعيلية': 'Ismailia',
      'أسيوط': 'Assiut',
      'اسيوط': 'Assiut',
      'أقصر': 'Luxor',
      'اقصر': 'Luxor',
      'أسوان': 'Aswan',
      'اسوان': 'Aswan',
      'غردقة': 'Hurghada',
      'شرم': 'Sharm El Sheikh'
    };

    for (const [ar, en] of Object.entries(arabicMap)) {
      if (cityName.includes(ar)) return en;
    }

    return null;
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
        this._Toastr.success('New delivery address has been saved!', 'Address Saved');
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
        this._Toastr.success('Address removed from your address book.', 'Address Removed');
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
    this.passwordErrorMessage = null;
    this.passwordSuccessMessage = null;

    const payload = this.changePasswordForm.value;
    this._ProfileService.changePassword(payload).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        this.changePasswordForm.reset();
        this.passwordSuccessMessage = 'Your password has been changed successfully.';

        if (res?.token) {
          this._AuthService.handleSuccessfulAuth(res, this.userAvatar);
        }

        this._Toastr.success('Password changed successfully!', 'Security Updated');
        setTimeout(() => {
          this.activeTab = 'overview';
          this.passwordSuccessMessage = null;
        }, 1500);
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        const formatted = formatApiError(err, '/changeMyPassword');
        this.passwordErrorMessage = formatted.message;
        this._Toastr.error(formatted.message, formatted.title);
      }
    });
  }
}
