<<<<<<< HEAD
# Foody — Online Food Delivery System

Vanilla HTML, CSS and JavaScript food delivery demo with Admin, User and Manager modules. Built by the Harsha team.

## Run
Open `index.html` in a browser (or use the VS Code Live Server extension).

## Demo logins
| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| User    | user     | user123    |
| Manager | manager  | manager123 |

## Inspect in DevTools
Open Inspect > Console. The repository info and module data print on load. Type any of these to read live state:
`window.foodyRepository`, `window.adminModuleData`, `window.userModuleData`, `window.managerModuleData`

## Files
- `index.html` structure
- `style.css` dark glass theme
- `script.js` logic and state

## Data storage
Customers, cart and orders save automatically to the browser's `localStorage` (key `foody-data-v1`) after every action, so they survive a refresh. Run `window.resetFoodyData()` in the console to restore the defaults. Login sessions are not saved: refreshing logs you out.

## Publish to GitHub
```
git remote add origin https://github.com/YOUR-USERNAME/foody-food-delivery.git
git push -u origin main
```
=======
# food-delivery-system
>>>>>>> d6b0d468bed33dc0b59262382a01fecfe7160b5c
