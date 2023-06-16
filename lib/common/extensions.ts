// String extension functions
/**
 * 1 -> Import using -> import '../common/extensions'
 * 2 -> Use it using -> "String".equalsIgnoreCase("string")
 */
interface String {
	equals(other: any): boolean;
	equalsIgnoreCase(other: any): boolean;
}
String.prototype.equals = function (other: any) {
	return (!other || (!(typeof other === "string") && !(other instanceof String)) || this.length != other.length)
		? false
        : this.valueOf() === other.valueOf();
};
String.prototype.equalsIgnoreCase = function (other: any) {
	return (!other || (!(typeof other === "string") && !(other instanceof String)) || this.length != other.length)
		? false
        : this === other || this.toLowerCase() === other.toLowerCase()
};