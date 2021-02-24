export class TextUtil {
  /**
   * Ellipsize text to shorten it.
   * 
   * Takes the first 'maxLength' characters of 'text' and replaces the remaining characters with an ellipsis.
   */
  static ellipsize(text: string, maxLength: number) {
    let result = text;
    if (text.length > maxLength) {
      result = text.slice(0, maxLength) + "..."
    }

    return result;
  }
}