<script setup>
    import login from './LogInPage.vue';
    import signup from './SignUpPage.vue';
    import { useRouter } from 'vue-router'

    const router = useRouter();

    // clean up modals and focus after login redirect
    const handleRedirect = (path) => {
        const modalEl = document.getElementById('loginModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        modalEl.addEventListener(
            'hidden.bs.modal',
            () => {
            // Clean up any leftover modal classes or backdrops
            document.body.classList.remove('modal-open');
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach((backdrop) => backdrop.remove());

            router.push(path);
            },
            { once: true }
        );
    };
</script>

<template>
  <div class="container-fluid min-vh-100">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center flex-nowrap px-0 px-md-3 px-lg-5 mb-0">
      <!-- Logo -->
      <div class="d-flex align-items-center gap-2 flex-shrink-0">
        <img
          src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//laagain_logo.png"
          alt="Laagain Logo"
          style="height: 40px"
        />
        <span class="fs-4 fw-semibold">Laagain</span>
      </div>

      <!-- Auth Buttons -->
      <div class="btn-group custom-auth-buttons shadow-sm">
        <button class="btn btn-light px-md-4" data-bs-toggle="modal" data-bs-target="#loginModal">Log in</button>
        <button class="btn btn-primary px-md-4" data-bs-toggle="modal" data-bs-target="#signupModal">Sign up</button>
      </div>
    </div>

    <!-- Main Section -->
    <div class="row justify-content-center">
      <!-- Text Content -->
      <div id="textContainer" class="col-md-5 text-start p-6">
        <h1 class="display-4 fw-bold">Your Group,<br />One Game Plan.</h1>
        <p class="lead text-secondary fs-3">
          Laagain turns group plans into shared adventures—
          with collaborative tools every step of the way.
        </p>
        <div class="d-flex gap-2 mt-4 fs-5">
          <button class="btn btn-warning btn-lg text-white fw-semibold" data-bs-toggle="modal" data-bs-target="#signupModal">
            Get Started
          </button>
        </div>
      </div>

      <!-- Graphic -->
      <div class="col-md-7">
        <img
          src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//landing_graphic.png"
          alt="Group Planning Graphic"
          class="graphic"
        />
      </div>
    </div>

    <!-- Log In Modal -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4">
          <div class="modal-body">
            <login @redirect="handleRedirect" />
          </div>
        </div>
      </div>
    </div>

    <!-- Sign Up Modal -->
    <div class="modal fade" id="signupModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4">
          <div class="modal-body">
            <signup />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
    @import "../assets/styles/landing.css"; /* Import external CSS file */
</style>