# Internationalization (i18n) Documentation

This document explains how internationalization is implemented in the Family Expense Tracker frontend application.

## Overview

The application uses **Vue I18n** (version 9.9.0) to provide multi-language support. Currently, the app supports:
- 🇪🇸 **Spanish (Español)** - Default language
- 🇬🇧 **English**

## Features

✅ **Complete UI Translation**: All text in the interface is translatable
✅ **Language Persistence**: Selected language is saved in localStorage
✅ **Language Selector**: Dropdown in NavBar to switch languages
✅ **Default Language**: Spanish (es) is the default
✅ **Fallback Language**: If a translation is missing, it falls back to Spanish

## Project Structure

```
frontend/src/
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── es.json           # Spanish translations
│       └── en.json           # English translations
├── components/
│   └── LanguageSelector.vue  # Language switcher component
└── main.ts                 # i18n plugin registration
```

## Configuration

### i18n Setup (`src/i18n/index.ts`)

```typescript
import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';

const savedLocale = localStorage.getItem('locale') || 'es';

const i18n = createI18n({
  legacy: false,              // Use Composition API
  locale: savedLocale,        // Current language from localStorage
  fallbackLocale: 'es',       // Fallback to Spanish
  messages: {
    es,
    en,
  },
});
```

### Plugin Registration (`src/main.ts`)

```typescript
import i18n from './i18n';

app.use(i18n);
```

## Translation Files

### Structure

Translations are organized by feature/section:

```json
{
  "common": {           // Common/shared translations
    "appName": "...",
    "welcome": "..."
  },
  "nav": {              // Navigation
    "dashboard": "..."
  },
  "auth": {             // Authentication
    "login": { ... },
    "register": { ... }
  },
  "dashboard": { ... }, // Dashboard page
  "history": { ... },   // History page
  "environment": { ... }, // Environment management
  "expense": { ... },   // Expense management
  "validation": { ... }, // Form validations
  "errors": { ... }     // Error messages
}
```

### Adding New Translations

1. **Add to both language files** (`es.json` and `en.json`)
2. **Use nested structure** for organization
3. **Keep keys consistent** across languages

Example:

```json
// es.json
{
  "expense": {
    "addNew": "Añadir Nuevo Gasto"
  }
}

// en.json
{
  "expense": {
    "addNew": "Add New Expense"
  }
}
```

## Usage in Components

### Template Usage

```vue
<template>
  <!-- Simple translation -->
  <h1>{{ $t('common.appName') }}</h1>
  
  <!-- With interpolation -->
  <p>{{ $t('history.expensesCount', { count: 5 }) }}</p>
  
  <!-- In attributes -->
  <input :placeholder="$t('auth.login.emailPlaceholder')" />
</template>
```

### Script Usage (Composition API)

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Use in functions
const message = t('errors.generic');

if (error) {
  alert(t('expense.deleteFailed'));
}
</script>
```

### Changing Language Programmatically

```typescript
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

// Change language
locale.value = 'en';
localStorage.setItem('locale', 'en');
```

## Language Selector Component

The `LanguageSelector.vue` component provides a dropdown to switch languages:

### Features
- 🌐 Language icon
- 📝 Current language display
- ⬇️ Dropdown with all available languages
- ✅ Visual indicator for selected language
- 💾 Persists selection to localStorage

### Integration

Added to `NavBar.vue`:

```vue
<template>
  <nav>
    <!-- ... -->
    <LanguageSelector />
    <!-- ... -->
  </nav>
</template>

<script setup lang="ts">
import LanguageSelector from './LanguageSelector.vue';
</script>
```

## Translated Components

All components and views have been fully translated:

### Components
- ✅ NavBar
- ✅ LanguageSelector
- ✅ EnvironmentSelector
- ✅ AddExpenseForm
- ✅ ExpenseList

### Views
- ✅ LoginView
- ✅ RegisterView
- ✅ DashboardView
- ✅ HistoryView

## Translation Keys Reference

### Common
- `common.appName` - Application name
- `common.welcome` - Welcome message
- `common.loading` - Loading text
- `common.total` - Total
- `common.cancel` - Cancel button
- `common.save` - Save button
- etc.

### Authentication
- `auth.login.*` - Login page texts
- `auth.register.*` - Registration page texts

### Navigation
- `nav.dashboard` - Dashboard link
- `nav.history` - History link
- `nav.logout` - Logout button

### Expenses
- `expense.addNew` - Add expense title
- `expense.currentExpenses` - Current expenses list
- `expense.compute` - Compute button
- `expense.deleteConfirm` - Delete confirmation
- etc.

### Environments
- `environment.select` - Select environment
- `environment.newEnvironment` - New environment button
- `environment.createNew` - Create modal title
- etc.

## Adding a New Language

1. **Create new locale file**: `src/i18n/locales/fr.json` (example for French)

2. **Copy structure from existing file**:
   ```bash
   cp src/i18n/locales/es.json src/i18n/locales/fr.json
   ```

3. **Translate all strings** in the new file

4. **Import in i18n config**:
   ```typescript
   import fr from './locales/fr.json';
   
   const i18n = createI18n({
     // ...
     messages: {
       es,
       en,
       fr,  // Add new language
     },
   });
   ```

5. **Add to LanguageSelector**:
   ```typescript
   const languages = [
     { code: 'es', name: 'Español' },
     { code: 'en', name: 'English' },
     { code: 'fr', name: 'Français' },  // Add new language
   ];
   ```

## Best Practices

1. **Never hardcode text** - Always use translation keys
2. **Keep keys organized** - Use nested structure by feature
3. **Use meaningful key names** - Keys should describe the content
4. **Translate all languages** - When adding keys, add to ALL locale files
5. **Test language switching** - Ensure all text changes correctly
6. **Use interpolation** for dynamic content:
   ```typescript
   // Good
   $t('history.expensesCount', { count: expenses.length })
   
   // Bad
   `${expenses.length} gastos`
   ```

## Pluralization

Vue I18n supports pluralization:

```json
{
  "expense": {
    "count": "no expenses | one expense | {count} expenses"
  }
}
```

Usage:
```vue
{{ $t('expense.count', expenses.length) }}
```

## Date and Number Formatting

While translations handle text, date/number formatting can be locale-aware:

```typescript
// In components
const formatDate = (date: Date) => {
  return date.toLocaleDateString(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
```

## Testing

### Manual Testing

1. Start the application
2. Click the language selector in NavBar
3. Switch between Spanish and English
4. Verify all text changes correctly
5. Refresh page - language should persist
6. Check localStorage has 'locale' key

### Checklist

- [ ] All visible text is translated
- [ ] Placeholders are translated
- [ ] Button text is translated
- [ ] Error messages are translated
- [ ] Confirmation dialogs are translated
- [ ] Language persists after refresh
- [ ] Default language is Spanish
- [ ] Language selector works correctly

## Troubleshooting

### Translation not showing

**Problem**: Seeing translation key instead of text (e.g., `common.appName`)

**Solutions**:
1. Check key exists in JSON file
2. Verify key path is correct
3. Check for typos in key name
4. Ensure JSON is valid (no trailing commas)

### Language not persisting

**Problem**: Language resets to Spanish on refresh

**Solutions**:
1. Check localStorage is working
2. Verify `localStorage.setItem('locale', code)` is called
3. Check browser console for errors

### Missing translation in one language

**Problem**: Translation works in Spanish but not English

**Solution**: Add the missing key to `en.json`

## Future Enhancements

- 🔲 Add more languages (French, German, etc.)
- 🌍 Auto-detect user's browser language
- 📊 RTL support for Arabic/Hebrew
- 📋 Backend error message translation
- 🗓️ Date/time formatting per locale
- 💱 Currency formatting per locale

## Resources

- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
- [Vue I18n Composition API](https://vue-i18n.intlify.dev/guide/advanced/composition.html)
- [Translation File Format](https://vue-i18n.intlify.dev/guide/essentials/syntax.html)
