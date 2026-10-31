import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly _ProfileService = inject(ProfileService);
  readonly _AuthService = inject(AuthService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _Toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  activeTab: ProfileTab = 'overview';
  isLoading = true;
  isUpdatingProfile = false;
  isSavingAddress = false;
  isChangingPassword = false;
  isDeletingAddressId: string | null = null;
  isAddAddressModalOpen = false;

  // GPS & Map state
  isDetectingLocation = false;
  locationError: string | null = null;
  currentCoords: { lat: number; lng: number } | null = null;
  private map: any = null;
  private marker: any = null;

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

  ngOnDestroy(): void {
    this.destroyMap();
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

    // Initialize interactive map once modal is mounted
    setTimeout(() => {
      this.initInteractiveMap();
    }, 150);
  }

  closeAddAddressModal(): void {
    this.isAddAddressModalOpen = false;
    this.locationError = null;
    this.isDetectingLocation = false;
    this.destroyMap();
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  // Interactive Leaflet Map initialization (Browser-only, SSR-safe)
  private async initInteractiveMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const mapElement = document.getElementById('address-map');
    if (!mapElement) return;

    this.destroyMap();

    try {
      const L = await import('leaflet');

      const defaultLat = this.currentCoords?.lat || 30.0444;
      const defaultLng = this.currentCoords?.lng || 31.2357;
      const defaultZoom = this.currentCoords ? 16 : 13;

      this.map = L.map(mapElement, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);

      // Custom crisp emerald location marker
      const pinIcon = L.divIcon({
        className: 'freshcart-map-marker',
        html: `
          <div style="transform: translate(-50%, -100%); position: relative;">
            <div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.45); border: 2.5px solid #ffffff;">
              <svg style="width: 18px; height: 18px; color: #ffffff;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div style="width: 12px; height: 4px; background: rgba(0,0,0,0.35); border-radius: 50%; filter: blur(1px); margin: 2px auto 0;"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      this.marker = L.marker([defaultLat, defaultLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(this.map);

      // Listen to marker dragend to update address details
      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.currentCoords = { lat: pos.lat, lng: pos.lng };
        this.reverseGeocode(pos.lat, pos.lng);
      });

      // Listen to map click to place pin exactly where user taps
      this.map.on('click', (e: any) => {
        const latlng = e.latlng;
        this.marker.setLatLng(latlng);
        this.currentCoords = { lat: latlng.lat, lng: latlng.lng };
        this.reverseGeocode(latlng.lat, latlng.lng);
      });

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 250);
    } catch {
      // Graceful fallback if map cannot load
    }
  }

  // GPS & High-Precision Geolocation Support
  useCurrentLocation(): void {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      this.detectLocationByIp();
      return;
    }

    this.isDetectingLocation = true;
    this.locationError = null;

    // 1. First attempt: High-accuracy hardware location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.applyDetectedLocation(latitude, longitude, false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.isDetectingLocation = false;
          this.locationError = 'Location access was denied. You can still tap directly on the map to pinpoint your location.';
          return;
        }

        // 2. Second attempt: Standard Wi-Fi/network accuracy
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            const { latitude, longitude } = fallbackPos.coords;
            this.applyDetectedLocation(latitude, longitude, false);
          },
          () => {
            // 3. Third attempt: Network IP lookup fallback
            this.detectLocationByIp();
          },
          { timeout: 7000, enableHighAccuracy: false, maximumAge: 300000 }
        );
      },
      { timeout: 6000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  }

  private applyDetectedLocation(lat: number, lng: number, isIpFallback = false): void {
    this.currentCoords = { lat, lng };

    if (this.map && this.marker) {
      this.map.flyTo([lat, lng], 17, { duration: 1.2 });
      this.marker.setLatLng([lat, lng]);
    }

    this.reverseGeocode(lat, lng, isIpFallback);
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
          this.applyDetectedLocation(data.latitude, data.longitude, true);
        } else {
          this.isDetectingLocation = false;
          const detectedCity = this.matchCity(data.city || data.region || '');
          if (detectedCity) {
            this.newAddressForm.patchValue({ city: detectedCity });
          }
          this._Toastr.info('City detected from network. Please tap your exact location on the map.', 'Location Detected');
        }
      })
      .catch(() => {
        this.isDetectingLocation = false;
        this.locationError = 'Could not detect your location automatically. You can tap directly on the map to place your pin.';
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
          ? 'Approximate location detected via network. Please adjust pin on map if needed.'
          : 'Exact location pinned on map and address details filled!';
        this._Toastr.info(msg, 'Location Pinned');
      })
      .catch(() => {
        this.isDetectingLocation = false;
        this.locationError = 'Could not lookup exact street name. Please review street details manually.';
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
        this.destroyMap();
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
