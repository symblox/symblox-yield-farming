//rate limiting
export function debounce(idle, action, context) {
    return function () {
        var ctx = this,
            args = arguments;
        clearTimeout(context.state.last);
        const id = setTimeout(function () {
            action.apply(ctx, args); // take action after `idle` amount of milliseconds delay
        }, idle);
        context.setState({
            last: id
        });
    };
}
