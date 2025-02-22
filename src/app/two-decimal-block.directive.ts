import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTwoDecimalBlock]'
})
export class TwoDecimalBlockDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const inputChar = event.key;
    const currentValue: string = this.el.nativeElement.value;
    const selectionStart = this.el.nativeElement.selectionStart;
    const selectionEnd = this.el.nativeElement.selectionEnd;

    // Allow control keys (like backspace) and non-character keys
    if (event.ctrlKey || event.metaKey || event.altKey || inputChar.length > 1) {
      return;
    }

    // If the key is not a digit or a dot, block it
    if (!/[\d\.]/.test(inputChar)) {
      event.preventDefault();
      return;
    }

    // If user tries to enter a dot and one already exists, block it.
    if (inputChar === '.') {
      if (currentValue.indexOf('.') !== -1) {
        event.preventDefault();
      }
      return;
    }

    // If there's already a decimal point, check if the insertion point is after the dot
    const dotIndex = currentValue.indexOf('.');
    if (dotIndex !== -1 && selectionStart > dotIndex) {
      // Calculate the number of digits after the decimal in the current selection range
      const afterDot = currentValue.substring(dotIndex + 1, selectionEnd);
      const totalAfterDot = currentValue.substring(dotIndex + 1).length - afterDot.length;

      // If already two digits exist after the dot and the user is not replacing an existing selection, block input.
      if (currentValue.substring(dotIndex + 1).length >= 2 && selectionStart === selectionEnd) {
        event.preventDefault();
      }
    }
  }
}
