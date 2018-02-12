const NORMAL_COLOR = 'rgb(255, 128, 128)';
const OVER_COLOR = 'rgb(255, 200, 200)';

export default point_types = [
    {
        type: new Point(1),
        title: "Обычная",
        view: just_color_point_drawer(NORMAL_COLOR, OVER_COLOR)
    },
    {
        type: new Point(0),
        title: "Закрепленная",
        view: just_color_point_drawer('red', 'rgb(255, 80, 80)')
    }
];

const CIRCLE_RADIUS = 8;

function just_color_point_drawer(color_normal, color_over) {
    return function (g, over) {
        let color = over ? color_over : color_normal;
        g
            .clear()
            .beginStroke('black')
            .setStrokeStyle(1)
            .beginFill(color)
            .drawCircle(0, 0, CIRCLE_RADIUS);
    };
}