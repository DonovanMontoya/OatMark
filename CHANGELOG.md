# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2025-12-01

### Changed
- Improved "Load more shops" functionality with automatic radius expansion
- Button now automatically searches at increasing distances until new shops are found (up to 500km)
- Added visual feedback showing current search radius in button text
- Loading state now persists across automatic radius expansions

### Fixed
- Fixed user experience issue where users had to click "Load more shops" multiple times before seeing results
- Search now stops at 500km maximum distance with clear messaging when limit reached

## [1.0.1] - 2025-11-06

### Added
- Enhanced login page functionality
- Initial public release
- Coffee shop discovery with map interface
- User authentication with Firebase
- Favorite shops functionality
- Offline caching support with 24-hour expiration
- Light/dark theme switching
- Shop submission and admin approval workflow

### Changed
- Migrated from Google Maps to platform-specific map providers (OpenStreetMap for Android, Apple Maps for iOS)

[unreleased]: https://github.com/DonovanMontoya/OatMark/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/DonovanMontoya/OatMark/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/DonovanMontoya/OatMark/releases/tag/v1.0.1
