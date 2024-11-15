class CustomDate extends Date {
	constructor(...args) {
		super(...args);
		// Cộng thêm 7 giờ vào thời gian hiện tại
		this.setTime(this.getTime() + 7 * 60 * 60 * 1000);
	}
}

export default CustomDate
