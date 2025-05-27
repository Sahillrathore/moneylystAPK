import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { G, Circle, Text as SVGText } from "react-native-svg";

const { width } = Dimensions.get("window");
const size = 200;
const strokeWidth = 30;
const radius = (size - strokeWidth) / 2;
const cx = size / 2;
const cy = size / 2;
const circumference = 2 * Math.PI * radius;

const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let startAngle = 0;

    const renderSegments = () =>
        data.map((item, index) => {
            const value = item.amount / total;
            const strokeDasharray = [value * circumference, circumference];
            const rotation = startAngle;
            startAngle += value * 360;

            return (
                <Circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    rotation={rotation}
                    origin={`${cx}, ${cy}`}
                />
            );
        });

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <G rotation={-90} origin={`${cx}, ${cy}`}>
                    {renderSegments()}
                </G>
                <SVGText
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="18"
                    fill="#333"
                >
                    ₹{total}
                </SVGText>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: 24,
    },
});

export default DonutChart;
