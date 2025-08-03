# Themelyf Dashboard Application

A comprehensive Spring Boot web application featuring a modern dashboard with search, edit, and component demonstration capabilities. Built with Java 17, Spring Boot 3.2, Thymeleaf, and TailwindCSS.

## Features

### 🚀 Core Functionality
- **Dashboard Management**: Create, read, update, and delete dashboard items
- **Advanced Search**: Real-time search with debouncing and caching
- **Smart Filtering**: Filter by category and status with live updates
- **Responsive Design**: Mobile-first design using TailwindCSS

### 🎨 UI Components
- **Modals**: Basic, form, image, and fullscreen modals
- **Confirmations**: Delete, save, warning, and custom confirmation dialogs
- **Popups & Tooltips**: Interactive popups, tooltips, and context menus
- **Notifications**: Toast notifications with different types (success, error, warning, info)
- **Loading States**: Spinners, progress bars, and skeleton loading
- **Form Components**: Advanced form elements with validation

### ⚡ Performance Features
- **Server-side Caching**: Spring Cache with configurable cache managers
- **Browser Caching**: localStorage-based caching with timeout management
- **Optimized Assets**: Static resource caching with appropriate cache headers
- **Debounced Search**: Prevents excessive API calls during typing

### 🔧 Technical Stack
- **Backend**: Java 17, Spring Boot 3.2, Spring Data JPA, H2 Database
- **Frontend**: Thymeleaf, TailwindCSS, Font Awesome, Vanilla JavaScript
- **Caching**: Spring Cache, Browser localStorage
- **Build Tool**: Maven

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd themelyf-expert
   ```

2. **Build the application**:
   ```bash
   mvn clean compile
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**:
   - Dashboard: http://localhost:8080
   - Components Demo: http://localhost:8080/components
   - H2 Console: http://localhost:8080/h2-console

### H2 Database Configuration
- **URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: `password`

## Application Structure

```
src/main/java/com/themelyf/dashboard/
├── DashboardApplication.java          # Main Spring Boot application
├── controller/
│   └── DashboardController.java       # Web controller handling HTTP requests
├── model/
│   └── DashboardItem.java            # JPA entity for dashboard items
├── repository/
│   └── DashboardItemRepository.java   # Data access layer
├── service/
│   └── DashboardService.java         # Business logic with caching
└── config/
    ├── CacheConfig.java              # Cache configuration
    └── DataInitializer.java          # Sample data initialization

src/main/resources/
├── templates/                        # Thymeleaf templates
│   ├── dashboard.html               # Main dashboard page
│   ├── item-detail.html             # Item detail view
│   ├── item-edit.html               # Item edit form
│   ├── components-demo.html         # Component examples
│   └── layout.html                  # Base layout template
├── static/
│   └── js/
│       └── dashboard.js             # Frontend JavaScript functionality
└── application.yml                   # Application configuration
```

## API Endpoints

### Web Pages
- `GET /` - Main dashboard with search and filtering
- `GET /item/{id}` - View item details
- `GET /item/{id}/edit` - Edit item form
- `GET /components` - Component demonstration page

### Form Actions
- `POST /item/save` - Create or update an item
- `POST /item/{id}/delete` - Delete an item

### API Endpoints
- `GET /api/search?q={query}` - Search items (JSON response)

## Features in Detail

### Dashboard Management
- **CRUD Operations**: Full create, read, update, delete functionality
- **Real-time Search**: Search across title, description, and category
- **Advanced Filtering**: Filter by category and status simultaneously
- **Responsive Grid**: Adapts to different screen sizes

### Caching Strategy

#### Server-side Caching
- **Cache Names**: `dashboardItems`, `itemsByCategory`, `itemsByStatus`, `searchResults`, `categories`, `statuses`
- **Cache Eviction**: Automatic cache invalidation on data modifications
- **Cache Manager**: Spring's `ConcurrentMapCacheManager`

#### Browser Caching
- **localStorage**: Caches search results and page data
- **Timeout Management**: 5-minute cache timeout with automatic cleanup
- **Visual Indicators**: Shows cache hit indicators to users
- **Keyboard Shortcuts**: `Ctrl+K` for search, `Ctrl+N` for new item

### Component Examples

#### Modals
- **Basic Modal**: Simple content display
- **Form Modal**: Interactive forms with validation
- **Image Modal**: Media content display
- **Fullscreen Modal**: Full-screen overlays

#### Notifications
- **Toast Notifications**: Slide-in notifications with auto-dismiss
- **Alert Messages**: Server-side flash messages
- **Confirmation Dialogs**: Custom confirmation workflows

#### Interactive Elements
- **Tooltips**: Hover-based help text
- **Popovers**: Click-based content overlays
- **Context Menus**: Right-click functionality
- **Dropdown Menus**: Multi-select and single-select options

### Form Validation
- **Client-side Validation**: Real-time form validation with visual feedback
- **Server-side Validation**: Spring Boot validation annotations
- **Custom Validators**: Business logic validation
- **Error Handling**: User-friendly error messages

## Customization

### Adding New Item Types
1. Extend the `DashboardItem` entity with new fields
2. Update the repository with custom queries
3. Modify the service layer for new business logic
4. Update templates to display new fields

### Styling Customization
- **TailwindCSS**: Utility-first CSS framework
- **Custom Colors**: Defined in the Tailwind config
- **Component Styling**: Modular CSS classes
- **Responsive Design**: Mobile-first breakpoints

### Cache Configuration
- **Cache Duration**: Modify timeout values in `CacheConfig.java`
- **Cache Scope**: Add new cache regions as needed
- **Cache Provider**: Switch to Redis or other providers for production

## Development Tips

### Debugging
- **H2 Console**: Access at `/h2-console` for database inspection
- **Logging**: DEBUG level logging enabled for the application package
- **Browser DevTools**: Network tab shows cache hits/misses

### Performance Optimization
- **Database Queries**: Use Spring Data JPA query methods
- **Static Resources**: Configured with appropriate cache headers
- **JavaScript**: Debounced search and event handling
- **CSS**: TailwindCSS purges unused styles in production

### Testing
- **Unit Tests**: Test service layer methods
- **Integration Tests**: Test controller endpoints
- **Frontend Testing**: Test JavaScript functionality

## Production Deployment

### Configuration Changes
1. **Database**: Switch from H2 to PostgreSQL/MySQL
2. **Caching**: Use Redis for distributed caching
3. **Static Assets**: Configure CDN for static resources
4. **Security**: Add authentication and authorization
5. **Monitoring**: Add application monitoring and logging

### Environment Variables
```bash
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=your_database_url
CACHE_TYPE=redis
REDIS_URL=your_redis_url
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please create an issue in the repository or contact the development team.