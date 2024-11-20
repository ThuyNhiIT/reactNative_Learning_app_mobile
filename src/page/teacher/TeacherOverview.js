import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../../component/TeacherProfile/Layout_Teacher";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherOverview } from "../../redux/teacherSlide";
import { useToast } from "../../component/customToast"; // Toast for messages

export default function TeacherOverview() {
  const dispatch = useDispatch();
  const { teacherOverview, isLoading, isError } = useSelector(
    (state) => state.teacher
  );
  const { showToast } = useToast();

  const teacherID = 1; // ID của giáo viên

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    dispatch(fetchTeacherOverview(teacherID));
  }, [dispatch]);

  // Trạng thái loading
  if (isLoading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  // Trạng thái lỗi
  if (isError) {
    showToast("Failed to load teacher data");
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data</Text>
        </View>
      </Layout>
    );
  }

  // Không có dữ liệu
  if (!teacherOverview || Object.keys(teacherOverview).length === 0) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </Layout>
    );
  }

  // Destructure dữ liệu giáo viên
  const { userName, image, description, email, phone, address } =
    teacherOverview;

  return (
    <Layout>
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Image
            source={
              image
                ? { uri: image }
                : require("../../../img/Teacher_Profile/teacher.jpg")
            } // Image mặc định nếu không có ảnh
            style={styles.infoCardImage}
          />
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardName}>{userName}</Text>
            <Text style={styles.infoCardJob}>UX/UI Design</Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.contactText}>{phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.contactText}>{address}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.contactText}>{email}</Text>
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoCardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoCardText: {
    flex: 1,
    marginLeft: 12,
  },
  infoCardName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  infoCardJob: {
    fontSize: 14,
    color: "#666",
  },
  followButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  seeMoreText: {
    color: "#4A90E2",
    fontSize: 14,
    marginTop: 8,
  },
  contactContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
});
