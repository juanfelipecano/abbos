import { InjectionToken } from '@angular/core';
import { AbControlShape, AbControlSize } from '../constants';

export const CONTROL_SHAPE = new InjectionToken<AbControlShape>('ControlShape');

export const CONTROL_SIZE = new InjectionToken<AbControlSize>('ControlSize');
