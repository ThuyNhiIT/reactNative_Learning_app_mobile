import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { WebView } from 'react-native-webview';
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "../../../component/customToast";

import { useDispatch, useSelector } from "react-redux";
import { getLessonByCourse } from "../../../redux/lessonSlice";
import { findCourseByID } from "../../../redux/courseSlice";
import { addUrlVideo } from "../../../redux/lessonSlice";

export default function CourseDetailLesson({ navigation, route }) {
  const listLesson = useSelector((state) => state.lesson.listLesson); // lấy thông tin lesson
  const courseDetail = useSelector((state) => state.course.courseDetail); // lấy thông tin course từ route id
  const urlVideo = useSelector((state) => state.lesson.urlVideo); // lấy url video
  const dispatch = useDispatch();
  const toast = useToast();

  const [lessons, setLessons] = useState([]); // khởi tạo state lessons
  const [course, setCourse] = useState({}); // khởi tạo state course
  const [expandedSections, setExpandedSections] = useState([]); // Trạng thái mở rộng của từng lesson
  const [activeIndex, setActiveIndex] = useState(null); // trạng thái khi chuyển màu khi chọn lesson
  const courseID = route.params.params?.courseID; // lấy sẵn id để truyền vào cart

  useEffect(() => {
    dispatch(findCourseByID(courseID)); // Gửi action để lấy thông tin course
    dispatch(getLessonByCourse(courseID)); // gọi api lấy danh sách lesson
  }, []);

  // top-page detail course
  useEffect(() => {
    setCourse(courseDetail);
  }, [courseDetail]);

  // lessons
  useEffect(() => {
    if (listLesson.length !== 0) {
      setLessons(listLesson);
    }
  }, [listLesson]);

  const LessonItem = ({ number, name, status, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.lessonItem, isActive && styles.activeLessonItem]}
      onPress={onPress}
    >
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonNumber}>
          {number.toString().padStart(2, "0")}
        </Text>
        <View>
          <Text style={styles.lessonTitle}>{name}</Text>
        </View>
      </View>
      {status === 2 && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
      {status === 1 && (
        <Ionicons name="play-circle" size={24} color="#2196F3" />
      )}
      {status === "locked" && (
        <Ionicons name="lock-closed" size={24} color="#9E9E9E" />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, expanded, onPress }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={onPress}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={24}
        color="#757575"
      />
    </TouchableOpacity>
  );

  // hiệu ứng mở rộng lesson
  const toggleExpand = (lessonIndex) => {
    setExpandedSections(
      (prev) =>
        prev.includes(lessonIndex)
          ? prev.filter((index) => index !== lessonIndex) // Thu gọn nếu đang mở
          : [...prev, lessonIndex] // Mở nếu đang đóng
    );
  };

  const onClickVideo = async (lessonIndex, videoIndex, urlVideo) => {
    setActiveIndex({ lessonIndex, videoIndex });
    await dispatch(addUrlVideo(urlVideo));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {Platform.OS === "web" ? (
          // Dùng iframe cho nền web
          <iframe
            src={urlVideo}
            width="100%"
            height="300"
            title="YouTube Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: "none" }}
          ></iframe>
        ) : (
          // Dùng WebView cho Android/iOS
          <WebView
            source={{ uri: urlVideo }}
            style={{ flex: 1, width: "100%", height: 300 }}
          />
        )}

        <View style={styles.courseInfo}>
          <Text style={styles.courseSubtitle}>
            {course.name}: {course.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {course.averageRating} ({course.totalRating}) •{" "}
              {course.totalLessons} lessons
            </Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() =>
              navigation.navigate("courseDetailOverView", { courseID })
            }
          >
            <Text style={styles.tabText}>OVERVIEW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>LESSONS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() =>
              navigation.navigate("courseDetailReview", { courseID })
            }
          >
            <Text style={styles.tabText}>REVIEW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {lessons.map((lesson, lessonIndex) => (
            <View key={lessonIndex}>
              <SectionHeader
                title={lesson.title}
                expanded={expandedSections.includes(lessonIndex)} // Trạng thái mở rộng
                onPress={() => toggleExpand(lessonIndex)} // Xử lý nhấn
              />
              {/* khi nào SectionHeader mở thì mới đc chọn */}
              {expandedSections.includes(lessonIndex) && (
                <View>
                  {lesson.Video &&
                    lesson.Video.map((video, videoIndex) => (
                      <LessonItem
                        key={`${lessonIndex}-${videoIndex}`}
                        number={videoIndex + 1}
                        name={video.name}
                        status={lessonIndex >= 1 ? "locked" : video.state} // Set status to 'block' for elements from the second one
                        isActive={
                          activeIndex?.lessonIndex === lessonIndex &&
                          activeIndex?.videoIndex === videoIndex
                        } // Kiểm tra active
                        onPress={
                          () =>
                            lessonIndex < 2
                              ? onClickVideo(lessonIndex, videoIndex, video.urlVideo) // Chạy hàm cho bài không bị khóa
                              : toast(
                                  "You need to complete the previous lesson",
                                  "error"
                                ) // Hiện thông báo khi bài bị khóa
                        }
                      />
                    ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {" "}
            ${course?.Orders?.length > 0 && course.Orders[0]?.OrderDetail.price}
          </Text>
          <Text style={styles.originalPrice}>$1020</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statusBar: {
    height: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  time: {
    fontSize: 15,
    fontWeight: "bold",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 6,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  battery: {
    width: 22,
    height: 11,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 2,
    justifyContent: "center",
    padding: 1,
  },
  batteryLevel: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  batteryTip: {
    width: 1,
    height: 4,
    backgroundColor: "black",
    marginLeft: 1,
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#00BCD4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#757575",
  },
  activeTabText: {
    color: "#00BCD4",
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lessonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activeLessonItem: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  lessonInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 12,
    color: "#757575",
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "500",
  },

 
  courseInfo: {
    padding: 16,
  },
  courseSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 4,
    color: "#757575",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
  },
  originalPrice: {
    fontSize: 16,
    color: "#757575",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  addToCartButton: {
    backgroundColor: "#00BCD4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
