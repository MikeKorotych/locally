# Locally: Application Context

## Ukrainian (UA)

**Locally** — мобільний застосунок на основі карт, який поєднує:
- маркетплейс товарів
- платформу послуг і фрилансу
- локальну соціальну утилітарну мережу

### Основні екрани та поведінка
- Головний екран — карта.
- Користувач бачить своє місцезнаходження та може «гуляти» картою жестами.
- Будівлі на карті зафарбовуються, якщо хтось у цьому будинку продає товари або надає послуги:
  - товари — синій
  - послуги — помаранчевий
  - мікс — середній колір або градієнт
- На далеких масштабах показуються кластери (кружечки з цифрами).

### Юзер-сторі (фокус на будівлі)
- Після тапу на будівлю з товарами/послугами камера плавно фокусується на ній.
- Вибрана будівля візуально виділяється (інший колір або більша прозорість).

### Адреса користувача
- Додаток має визначати поточну адресу будинку, де знаходиться користувач.
- При створенні товару/послуги адреса підтягується автоматично.
- Користувач може відкоригувати адресу вручну, встановивши маркер на будівлю (як у застосунках таксі).

### Поточний технічний фокус
- Реалізація підсвічування будівель на тап.
- Оптимізація підсвічування для 3D-перспективи.

## English (EN)

**Locally** is a maps-based mobile application that combines:
- a marketplace for goods
- a services & freelance platform
- a local social utility network

### Main screens and behavior
- The main screen is the map.
- The user sees their location and can explore the map with gestures.
- Buildings are colored if someone in the building sells goods or provides services:
  - goods — blue
  - services — orange
  - mixed — mid color or gradient
- At far zoom levels, clusters are shown (circles with numbers).

### User story (building focus)
- When the user taps a building with goods/services, the camera smoothly focuses on it.
- The selected building is visually highlighted (different color or higher transparency).

### User address
- The app should determine the current address of the building where the user is located.
- When creating a listing/service, the address is filled automatically.
- The user can adjust it manually by placing a marker on a building (like taxi apps).

### Current technical focus
- Implementing building highlighting on tap.
- Optimizing highlighting for 3D perspective.
