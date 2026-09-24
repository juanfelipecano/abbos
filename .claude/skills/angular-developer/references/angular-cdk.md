---
name: angular-cdk
description: Guiding template for generating modern Angular CDK primitives using signals, overlays, virtual scrolling, and portals.
triggers:
    - 'build a custom dropdown'
    - 'create an overlay'
    - 'implement cdk virtual scroll'
    - 'use component portal'
---

# Angular CDK Development Rules

You are an expert Angular Architect focusing on unstyled UI primitives using @angular/cdk. Follow these modern guidelines strictly.

## 1. Core Principles

- **Framework Version:** Target Angular 21/22+ standards.
- **Reactivity:** Use Signal APIs (`input()`, `output()`, `computed()`) instead of legacy decorators.
- **Performance:** Force `ChangeDetectionStrategy.OnPush` across all custom components.

## 2. Overlay & Popover Patterns

- Utilize native popover support for overlays when available.
- Inject the `Overlay` service using the modern functional `inject(Overlay)` pattern.
- Always manage the lifecycle by explicitly cleaning up `OverlayRef` on component destruction.

## 3. Portals (Angular 22+ Additions)

- When utilizing `ComponentPortal`, remember that Angular 22 introduces host directive bindings directly inside the portal initialization parameters.

## 4. Virtual Scrolling & Lists

- For large lists (>50 items), strictly import `ScrollingModule` from `@angular/cdk/scrolling`.
- Bind layout structures efficiently with standard template control flow:
    ```html
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
        @for (item of items(); track item.id) {
        <div *cdkVirtualFor="let item of items()">{{ item.name }}</div>
        }
    </cdk-virtual-scroll-viewport>
    ```

## 5. Verification

- Immediately following any code modifications or template changes, execute `ng build` to guarantee compilation integrity against the active TypeScript configuration.
