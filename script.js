// ========================================
//  PROVIDER CONFIG
// ========================================
const PROVIDERS = {
    groq: {
        name: 'Groq',
        storageKey: 'mk_masterchef_groq_api_key',
        placeholder: 'Enter your Groq API key...',
        prefix: 'gsk_',
        hintText: '🔒 Groq keys start with "gsk_" • Stored locally, never shared.',
        createUrl: 'https://console.groq.com/keys',
        createLabel: 'Create Groq Key',
        model: 'llama-3.1-8b-instant',
        apiType: 'openai-compat',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        statusClass: 'connected',
        dotClass: 'connected-groq',
        statusLabel: 'Connected • Groq ⚡',
        statusBarText: 'Powered by Groq AI ⚡',
    },
    openai: {
        name: 'ChatGPT',
        storageKey: 'mk_masterchef_openai_api_key',
        placeholder: 'Enter your OpenAI API key...',
        prefix: 'sk-',
        hintText: '🔒 OpenAI keys start with "sk-" • Stored locally, never shared.',
        createUrl: 'https://platform.openai.com/api-keys',
        createLabel: 'Create OpenAI Key',
        model: 'gpt-4o-mini',
        apiType: 'openai-compat',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        statusClass: 'connected-openai',
        dotClass: 'connected-openai',
        statusLabel: 'Connected • ChatGPT 🤖',
        statusBarText: 'Powered by OpenAI ChatGPT 🤖',
    },
    gemini: {
        name: 'Gemini',
        storageKey: 'mk_masterchef_gemini_api_key',
        placeholder: 'Enter your Gemini API key...',
        prefix: 'AIza',
        hintText: '🔒 Gemini keys start with "AIza" • Stored locally, never shared.',
        createUrl: 'https://aistudio.google.com/app/apikey',
        createLabel: 'Create Gemini Key',
        model: 'gemini-1.5-flash',
        apiType: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        statusClass: 'connected-gemini',
        dotClass: 'connected-gemini',
        statusLabel: 'Connected • Gemini ✨',
        statusBarText: 'Powered by Google Gemini ✨',
    }
};

const TOTAL_INPUTS = 10;
let currentProvider = localStorage.getItem('mk_masterchef_provider') || 'groq';


// ========================================
//  INTRO SCREEN
// ========================================
function enterKitchen() {
    const intro = document.getElementById('introScreen');
    intro.classList.add('slide-out');
    setTimeout(() => {
        intro.style.display = 'none';
    }, 950);
}


// ========================================
//  TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'success', icon = '✅') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
    document.getElementById('toastText').textContent = message;
    document.getElementById('toastIcon').textContent = icon;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}


// ========================================
//  PROVIDER SWITCHING
// ========================================
function switchProvider(provider) {
    currentProvider = provider;
    localStorage.setItem('mk_masterchef_provider', provider);

    // Update tab active states
    document.querySelectorAll('.provider-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.provider === provider);
    });

    // Update input placeholder & hint
    const cfg = PROVIDERS[provider];
    const input = document.getElementById('apiKeyInput');
    input.placeholder = cfg.placeholder;
    document.getElementById('apiHint').innerHTML = `<span>${cfg.hintText}</span>`;
    document.getElementById('createKeyLink').href = cfg.createUrl;
    document.getElementById('createKeyLabel').textContent = cfg.createLabel;
    document.getElementById('providerKeyLabel').textContent = `🔑 ${cfg.name} API Key`;
    document.getElementById('statusBarText').textContent = cfg.statusBarText;

    // Load saved key for this provider
    const savedKey = localStorage.getItem(cfg.storageKey) || '';
    input.value = savedKey;
    input.className = 'api-key-input' + (savedKey ? ' saved' : '');
    input.type = 'password';
    document.getElementById('toggleVisibility').textContent = '👁️';

    updateApiStatus(!!savedKey);
    showToast(`Switched to ${cfg.name}`, 'success', cfg.name === 'Groq' ? '⚡' : cfg.name === 'ChatGPT' ? '🤖' : '✨');
}

function refreshTabDots() {
    ['groq', 'openai', 'gemini'].forEach(p => {
        const dot = document.getElementById(`${p}-dot`);
        const key = localStorage.getItem(PROVIDERS[p].storageKey);
        dot.className = 'ptab-dot' + (key ? ` ${PROVIDERS[p].dotClass}` : '');
    });
}


// ========================================
//  API KEY MANAGEMENT
// ========================================
function getApiKey() {
    return localStorage.getItem(PROVIDERS[currentProvider].storageKey) || '';
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    const cfg = PROVIDERS[currentProvider];

    if (!key) {
        showToast('Please enter an API key!', 'warning', '⚠️');
        input.focus();
        return;
    }

    if (!key.startsWith(cfg.prefix)) {
        showToast(`Invalid format. ${cfg.name} keys start with "${cfg.prefix}"`, 'error', '❌');
        return;
    }

    if (key.length < 20) {
        showToast('Key seems too short.', 'error', '❌');
        return;
    }

    localStorage.setItem(cfg.storageKey, key);
    updateApiStatus(true);
    input.classList.add('saved');
    refreshTabDots();

    const btn = document.getElementById('saveKeyBtn');
    document.getElementById('saveIcon').textContent = '✅';
    document.getElementById('saveText').textContent = 'Saved!';
    btn.classList.add('saved');

    setTimeout(() => {
        document.getElementById('saveIcon').textContent = '💾';
        document.getElementById('saveText').textContent = 'Save';
        btn.classList.remove('saved');
    }, 2500);

    showToast(`${cfg.name} key saved securely!`, 'success', '🔑');
}

function removeApiKey() {
    const cfg = PROVIDERS[currentProvider];
    localStorage.removeItem(cfg.storageKey);
    const input = document.getElementById('apiKeyInput');
    input.value = '';
    input.classList.remove('saved', 'saved-openai', 'saved-gemini');
    updateApiStatus(false);
    refreshTabDots();
    showToast(`${cfg.name} key removed`, 'warning', '🗑️');
}

function updateApiStatus(connected) {
    const cfg = PROVIDERS[currentProvider];
    const status = document.getElementById('apiStatus');
    const text = document.getElementById('apiStatusText');
    const removeBtn = document.getElementById('removeKeyBtn');

    if (connected) {
        status.className = `api-status ${cfg.statusClass}`;
        text.textContent = cfg.statusLabel;
        removeBtn.classList.add('show');
    } else {
        status.className = 'api-status disconnected';
        text.textContent = 'Not Connected';
        removeBtn.classList.remove('show');
    }
}

function toggleKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const btn = document.getElementById('toggleVisibility');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function initApiSection() {
    // Set active tab
    document.querySelectorAll('.provider-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.provider === currentProvider);
    });

    // Apply config for active provider
    const cfg = PROVIDERS[currentProvider];
    const input = document.getElementById('apiKeyInput');
    input.placeholder = cfg.placeholder;
    document.getElementById('apiHint').innerHTML = `<span>${cfg.hintText}</span>`;
    document.getElementById('createKeyLink').href = cfg.createUrl;
    document.getElementById('createKeyLabel').textContent = cfg.createLabel;
    document.getElementById('providerKeyLabel').textContent = `🔑 ${cfg.name} API Key`;
    document.getElementById('statusBarText').textContent = cfg.statusBarText;

    const savedKey = getApiKey();
    if (savedKey) {
        input.value = savedKey;
        input.classList.add('saved');
        updateApiStatus(true);
    }

    refreshTabDots();
}


// ========================================
//  AI CALL ROUTER
// ========================================
async function callAI(messages, maxTokens = 1200, temperature = 0.8) {
    const cfg = PROVIDERS[currentProvider];
    const apiKey = getApiKey();

    if (cfg.apiType === 'openai-compat') {
        const response = await fetch(cfg.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: cfg.model,
                messages,
                temperature,
                max_tokens: maxTokens
            })
        });

        if (response.status === 401 || response.status === 403) {
            return { error: 'invalid_key' };
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        return { content: data.choices[0].message.content };

    } else {
        // Gemini format
        const systemMsg = messages.find(m => m.role === 'system');
        const userMsg   = messages.find(m => m.role === 'user');

        const body = {
            contents: [{ role: 'user', parts: [{ text: userMsg.content }] }],
            generationConfig: { temperature, maxOutputTokens: maxTokens }
        };
        if (systemMsg) {
            body.system_instruction = { parts: [{ text: systemMsg.content }] };
        }

        const response = await fetch(`${cfg.endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.status === 400 || response.status === 403) {
            return { error: 'invalid_key' };
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');
        return { content: text };
    }
}


// ========================================
//  INGREDIENT COUNTER
// ========================================
function updateIngredientCounter() {
    let count = 0;
    for (let i = 1; i <= TOTAL_INPUTS; i++) {
        if (document.getElementById(`ingredient${i}`).value.trim()) count++;
    }
    const counter = document.getElementById('ingredientCounter');
    counter.textContent = `${count} / ${TOTAL_INPUTS}`;
    counter.style.color = count > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.6)';
}


// ========================================
//  COLLECT ALL INGREDIENTS
// ========================================
function getAllIngredients() {
    const values = [];
    for (let i = 1; i <= TOTAL_INPUTS; i++) {
        const val = document.getElementById(`ingredient${i}`).value.trim();
        if (val) values.push(val);
    }
    return values;
}

function getAllInputElements() {
    const inputs = [];
    for (let i = 1; i <= TOTAL_INPUTS; i++) {
        inputs.push(document.getElementById(`ingredient${i}`));
    }
    return inputs;
}


// ========================================
//  AI-POWERED INGREDIENT VALIDATION
// ========================================
async function validateIngredientsWithAI(ingredients) {
    try {
        const result = await callAI([
            {
                role: 'system',
                content: `You are a strict food ingredient validator. Check if each item is a REAL food/cooking ingredient.

VALID: Any real food, spice, herb, condiment, cooking oil, dairy, grain, meat, seafood, vegetable, fruit, nut, seed, sauce, broth, baking ingredient.
INVALID: Random words, gibberish, non-food objects (electronics, furniture, clothing), names, places, abstract concepts, slang, nonsense.

RESPOND ONLY in exact JSON:
{"valid": true, "invalid_items": []}
OR
{"valid": false, "invalid_items": ["item1", "item2"]}

Be VERY strict. No explanations. Only JSON.`
            },
            {
                role: 'user',
                content: `Validate these ingredients: ${ingredients}`
            }
        ], 300, 0);

        if (result.error) return result;

        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { valid: true, invalid_items: [] };

    } catch (error) {
        console.error('AI Validation error:', error);
        return localValidation(ingredients.split(', '));
    }
}


// ========================================
//  LOCAL FALLBACK VALIDATION
// ========================================
const FOOD_KEYWORDS = [
    'chicken','beef','pork','lamb','fish','salmon','tuna','shrimp','prawn','crab','lobster','turkey','duck',
    'bacon','sausage','ham','steak','egg','eggs','tofu','tempeh','paneer','mutton','veal','cod','tilapia',
    'squid','octopus','clam','mussel','oyster','scallop','anchovy','sardine','mackerel',
    'tomato','onion','garlic','potato','carrot','broccoli','spinach','lettuce','cabbage','cauliflower',
    'pepper','bell pepper','chili','jalapeno','celery','cucumber','zucchini','eggplant','mushroom','corn',
    'pea','peas','bean','beans','asparagus','artichoke','beet','radish','turnip','sweet potato','squash',
    'pumpkin','kale','arugula','bok choy','leek','scallion','shallot','okra','fennel','ginger','lemongrass',
    'apple','banana','orange','lemon','lime','mango','pineapple','strawberry','blueberry','raspberry',
    'grape','watermelon','melon','peach','pear','plum','cherry','coconut','avocado','fig','date','kiwi',
    'rice','pasta','noodle','noodles','bread','flour','oat','oats','quinoa','barley','wheat','couscous',
    'tortilla','pita','roti','naan','spaghetti','penne','fettuccine','lasagna','ramen','udon','macaroni',
    'milk','cheese','butter','cream','yogurt','ghee','sour cream','mozzarella','cheddar','parmesan',
    'feta','ricotta','cream cheese','buttermilk','whey',
    'salt','pepper','cumin','turmeric','paprika','cinnamon','oregano','basil','thyme','rosemary',
    'parsley','cilantro','coriander','mint','dill','sage','bay leaf','cardamom','nutmeg','clove',
    'saffron','garam masala','chili powder','cayenne','tarragon','sumac',
    'olive oil','oil','vegetable oil','sesame oil','coconut oil','vinegar','soy sauce','fish sauce',
    'oyster sauce','mustard','ketchup','mayo','mayonnaise','hot sauce','sriracha','tahini','pesto',
    'salsa','miso','hoisin','teriyaki','worcestershire','bbq sauce',
    'almond','walnut','cashew','peanut','pistachio','pecan','hazelnut','sesame','chia','flax',
    'sugar','honey','maple syrup','molasses','agave','syrup',
    'baking powder','baking soda','yeast','cornstarch','cocoa','vanilla','chocolate',
    'stock','broth','water','wine','beer','coconut milk','tomato paste','tomato sauce',
    'lentil','lentils','chickpea','chickpeas','tofu','edamame','seitan',
    'apple cider vinegar','balsamic','rice vinegar',
    'spring onion','green onion','jalapeño','habanero','serrano',
    'portobello','shiitake','cremini','oyster mushroom',
    'mozzarella','brie','gouda','swiss','colby','jack','manchego',
    'prawns','crayfish','halibut','sea bass','trout','herring','eel','perch'
];

function localValidation(ingredientArray) {
    const invalid = [];
    ingredientArray.forEach(item => {
        const lower = item.toLowerCase().trim();
        const isFood = FOOD_KEYWORDS.some(kw => lower.includes(kw) || kw.includes(lower));
        if (!isFood && lower.length > 2) invalid.push(item);
    });
    return { valid: invalid.length === 0, invalid_items: invalid };
}


// ========================================
//  SHOW ERROR OVERLAY
// ========================================
function showError(invalidItems = [], isApiError = false) {
    const overlay  = document.getElementById('errorOverlay');
    const card     = document.getElementById('errorCard');
    const icon     = document.getElementById('errorIcon');
    const title    = document.getElementById('errorTitle');
    const subtitle = document.getElementById('errorSubtitle');
    const items    = document.getElementById('errorItems');

    items.innerHTML = '';

    if (isApiError) {
        card.className = 'error-card api-error';
        icon.textContent = '🔑';
        title.textContent = 'API Key Required!';
        subtitle.innerHTML = `No API key found for <strong>${PROVIDERS[currentProvider].name}</strong>.<br>Please enter and save your key above.`;
    } else {
        card.className = 'error-card';
        icon.textContent = '🚫';
        title.textContent = 'Invalid Ingredients Detected!';
        subtitle.innerHTML = "These don't look like real food ingredients.<br>Please enter actual cooking ingredients only.";
        invalidItems.forEach(item => {
            const tag = document.createElement('div');
            tag.className = 'error-tag';
            tag.innerHTML = `<span class="cross">✕</span>${item}`;
            items.appendChild(tag);
        });
    }

    overlay.classList.add('show');
}

function closeError() {
    document.getElementById('errorOverlay').classList.remove('show');
}


// ========================================
//  COOK MAGIC — MAIN FUNCTION
// ========================================
async function cookMagic() {
    const apiKey = getApiKey();
    const btn = document.getElementById('cookBtn');
    const responseSection = document.getElementById('responseSection');
    const responseBody = document.getElementById('responseBody');
    const allInputs = getAllInputElements();

    // Reset all states
    allInputs.forEach(i => i.classList.remove('input-error', 'input-valid'));
    responseSection.classList.remove('show');

    // Check API key
    if (!apiKey) {
        showError([], true);
        return;
    }

    const ingredientValues = getAllIngredients();

    if (ingredientValues.length === 0) {
        allInputs.forEach(i => i.classList.add('input-error'));
        showError(['No ingredients entered! Please fill at least one field.']);
        return;
    }

    const allIngredients = ingredientValues.join(', ');
    const cfg = PROVIDERS[currentProvider];

    // ===== STEP 1: AI VALIDATION =====
    btn.classList.add('validating');
    btn.disabled = true;
    document.querySelector('.loading-text').textContent = '🛡️ Validating ingredients...';

    const validation = await validateIngredientsWithAI(allIngredients);

    if (validation.error === 'invalid_key') {
        btn.classList.remove('validating');
        btn.disabled = false;
        localStorage.removeItem(cfg.storageKey);
        updateApiStatus(false);
        refreshTabDots();
        document.getElementById('apiKeyInput').value = '';
        document.getElementById('apiKeyInput').classList.remove('saved');
        showError([], true);
        showToast(`${cfg.name} API key is invalid or expired!`, 'error', '❌');
        return;
    }

    if (!validation.valid && validation.invalid_items && validation.invalid_items.length > 0) {
        btn.classList.remove('validating');
        btn.disabled = false;

        // Mark invalid inputs red
        ingredientValues.forEach(val => {
            if (validation.invalid_items.some(inv => inv.toLowerCase() === val.toLowerCase())) {
                allInputs.forEach(input => {
                    if (input.value.trim().toLowerCase() === val.toLowerCase()) {
                        input.parentElement.classList.add('input-error');
                    }
                });
            }
        });

        showError(validation.invalid_items);
        return;
    }

    // Mark all filled inputs as valid
    allInputs.forEach(i => {
        if (i.value.trim()) i.classList.add('input-valid');
    });

    // ===== STEP 2: GENERATE RECIPE =====
    btn.classList.remove('validating');
    btn.classList.add('loading');
    document.querySelector('.loading-text').textContent = `👨‍🍳 ${cfg.name} is cooking...`;

    try {
        const result = await callAI([
            {
                role: 'system',
                content: `You are MK Master Chef 👨‍🍳, a world-class AI chef with incredible creativity.
Given ingredients, create ONE amazing, detailed recipe using as many of the provided ingredients as possible.

Format:
## 🍽️ [Creative Recipe Name]

**⏱️ Time:** [Prep + Cook time]
**🍴 Servings:** [Number]
**📊 Difficulty:** [Easy/Medium/Hard]

### 📝 Ingredients
- [Full list with exact quantities — include the user's ingredients plus any essentials]

### 👨‍🍳 Instructions
1. [Step by step, clear and detailed]

### 💡 Chef's Pro Tip
[One amazing tip]

### 🌟 Serving Suggestion
[How to plate and serve]

Be enthusiastic, precise, and creative! Use emojis sparingly.`
            },
            {
                role: 'user',
                content: `Create a delicious recipe using these ${ingredientValues.length} ingredients: ${allIngredients}`
            }
        ], 1500, 0.8);

        if (result.error === 'invalid_key') throw new Error('Invalid API key.');

        const recipe = result.content;
        responseBody.innerHTML = formatMarkdown(recipe);

        // Update response header to show provider
        const providerBadge = { groq: '⚡ Groq', openai: '🤖 ChatGPT', gemini: '✨ Gemini' };
        document.getElementById('responseProvider').textContent =
            `Crafted by ${providerBadge[currentProvider]} • Just for you`;

        responseSection.classList.add('show');

        setTimeout(() => {
            responseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);

        showToast('Recipe ready! Bon appétit! 🎉', 'success', '🍽️');

    } catch (error) {
        console.error('Error:', error);
        responseBody.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div style="font-size:48px;margin-bottom:15px;">😅</div>
                <p style="color:#fca5a5;font-weight:600;font-size:16px;">Kitchen Malfunction!</p>
                <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:8px;">
                    ${error.message || 'Could not reach the AI chef. Check your API key.'}
                </p>
            </div>
        `;
        responseSection.classList.add('show');
    } finally {
        btn.classList.remove('loading', 'validating');
        btn.disabled = false;
        document.querySelector('.loading-text').textContent = 'AI is thinking...';
    }
}


// ========================================
//  MARKDOWN FORMATTER
// ========================================
function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li><strong>$1.</strong> $2</li>')
        .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}


// ========================================
//  EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initApiSection();
    updateIngredientCounter();

    // Ingredient input events
    getAllInputElements().forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') cookMagic();
        });

        input.addEventListener('input', () => {
            input.classList.remove('input-error', 'input-valid');
            input.parentElement.classList.remove('input-error');
            updateIngredientCounter();
        });

        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // API key input enter
    document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveApiKey();
    });

    // Close error overlay on background click
    document.getElementById('errorOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeError();
    });

    // Close error on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeError();
    });
});
