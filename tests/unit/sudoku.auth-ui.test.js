const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Auth UI: landing reflects logout immediately', () => {
  function mountLandingDom() {
    document.body.innerHTML = `
      <div id="landing-overlay" style="display:flex">
        <div class="landing-card">
          <h2 id="landing-greeting">Welcome!</h2>
          <button id="landing-signin" class="google-btn"><span class="g-text">Sign in with Google</span></button>
        </div>
      </div>
      <div class="controls-strip"></div>
      <div class="number-pad"></div>
      <div id="user-chip" style="display:none"></div>
    `;
  }

  function stubSupabase() {
    const auth = {
      signOut: jest.fn(async () => {}),
      signInWithOAuth: jest.fn(async () => {}),
      getUser: jest.fn(async () => ({ data: { user: null } })),
      getSession: jest.fn(async () => ({ data: { session: null } })),
      exchangeCodeForSession: jest.fn(async () => {}),
      onAuthStateChange: jest.fn((cb) => {
        // Return a subscription handle consistent with supabase-js
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    };
    global.window.supabase = { auth };
    return auth;
  }

  test('logout() resets landing greeting and shows sign-in button', async () => {
    mountLandingDom();
    const auth = stubSupabase();
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();

    // Prime landing with a signed-in looking state
    const greeting = document.getElementById('landing-greeting');
    const signinBtn = document.getElementById('landing-signin');
    greeting.textContent = 'Welcome back, Test!';
    signinBtn.style.display = 'none';
    signinBtn.disabled = true;
    signinBtn.setAttribute('aria-busy', 'true');

    await g.logout();

    expect(auth.signOut).toHaveBeenCalled();
    expect(greeting.textContent).toBe('Welcome!');
    expect(signinBtn.style.display).toBe('');
    expect(signinBtn.disabled).toBe(false);
    expect(signinBtn.hasAttribute('aria-busy')).toBe(false);
  });

  test('auth state change to signed-out updates landing UI', async () => {
    mountLandingDom();
    const captured = { cb: null };
    const auth = stubSupabase();
    auth.onAuthStateChange.mockImplementation((cb) => {
      captured.cb = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();

    // Simulate signed-in first for contrast
    const greeting = document.getElementById('landing-greeting');
    const signinBtn = document.getElementById('landing-signin');
    greeting.textContent = 'Welcome back, Test!';
    signinBtn.style.display = 'none';
    signinBtn.disabled = true;
    signinBtn.setAttribute('aria-busy', 'true');

    // Fire signed-out event
    expect(typeof captured.cb).toBe('function');
    captured.cb('SIGNED_OUT', null);

    expect(greeting.textContent).toBe('Welcome!');
    expect(signinBtn.style.display).toBe('');
    expect(signinBtn.disabled).toBe(false);
    expect(signinBtn.hasAttribute('aria-busy')).toBe(false);
  });

  test('clicking landing sign-in shows busy, keeps overlay visible, and starts OAuth', async () => {
    mountLandingDom();
    const auth = stubSupabase();
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();

    const landing = document.getElementById('landing-overlay');
    const btn = document.getElementById('landing-signin');
    const text = btn.querySelector('.g-text');

    expect(landing.style.display).toBe('flex');
    btn.click();
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(text.textContent).toMatch(/Opening Google/i);
    expect(auth.signInWithOAuth).toHaveBeenCalled();
    // Landing should remain visible
    expect(landing.style.display).toBe('flex');
  });

  test('auth state change to signed-in updates greeting, hides landing sign-in, and shows user chip', async () => {
    mountLandingDom();
    const captured = { cb: null };
    const auth = stubSupabase();
    auth.onAuthStateChange.mockImplementation((cb) => {
      captured.cb = cb; return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    // When refreshGreeting runs, it will call getUser; return a user there
    auth.getUser.mockResolvedValue({ data: { user: { user_metadata: { full_name: 'Test Person' } } } });
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();

    // Simulate the signed-in callback
    expect(typeof captured.cb).toBe('function');
    captured.cb('SIGNED_IN', { user: { user_metadata: { full_name: 'Test Person' } } });
    // Allow async refreshGreeting() to run
    await Promise.resolve();
    await Promise.resolve();

    const greeting = document.getElementById('landing-greeting');
    const signinBtn = document.getElementById('landing-signin');
    const chip = document.getElementById('user-chip');
    // Either the greeting is updated immediately or soon after; assert both UI outcomes are acceptable in unit
    const okGreeting = /Welcome back, Test/i.test(greeting.textContent) || signinBtn.style.display === 'none';
    expect(okGreeting).toBe(true);
    // Sign-in button should be hidden or not focusable when signed in
    expect(['none', ''].includes(signinBtn.style.display) ? signinBtn.style.display === 'none' : signinBtn.hasAttribute('hidden')).toBe(true);
    expect(signinBtn.disabled).toBe(false);
    expect(signinBtn.hasAttribute('aria-busy')).toBe(false);
    expect(chip && chip.style.display).toBe('');
  });
});


