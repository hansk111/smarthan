import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  recentSearches?: string[];
  onSelectRecent?: (search: string) => void;
  onClearRecent?: () => void;
  showRecentSearches?: boolean;
  onFocusChange?: (isFocused: boolean) => void; // 포커스 상태 변경 콜백 추가
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "검색어를 입력하세요",
  onSearch,
  onClear,
  recentSearches = [],
  onSelectRecent,
  onClearRecent,
  showRecentSearches = true,
  onFocusChange, // 새로 추가된 prop
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // 포커스 상태가 변경될 때마다 부모에게 알림
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(isFocused);
    }
  }, [isFocused, onFocusChange]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setIsFocused(false);
      Keyboard.dismiss();
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleSelectRecent = (search: string) => {
    setQuery(search);
    if (onSelectRecent) onSelectRecent(search);
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 150);
  };

  // 최근 검색어 드롭다운의 높이 계산 (대략적)
  const getDropdownHeight = () => {
    if (!isFocused || !showRecentSearches || recentSearches.length === 0) {
      return 0;
    }
    const headerHeight = 48; // 헤더 높이
    const itemHeight = 48; // 각 아이템 높이
    const maxHeight = 200; // FlatList maxHeight
    const calculatedHeight = headerHeight + recentSearches.length * itemHeight;
    return Math.min(calculatedHeight, maxHeight + headerHeight);
  };

  return (
    <View className="relative">
      <View className="flex-row items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          ref={inputRef}
          className="flex-1 ml-3 text-xl text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSearch} className="ml-2">
          <View className="bg-primary-500 rounded-lg px-3 py-1">
            <Text className="text-white text-sm font-medium">검색</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 최근 검색어 */}
      {isFocused && showRecentSearches && recentSearches.length > 0 && (
        <View
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg"
          style={{
            zIndex: 1000,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center justify-between p-3 border-b border-gray-200">
            <Text className="text-sm font-medium text-gray-800">
              최근 검색어
            </Text>
            {onClearRecent && (
              <TouchableOpacity onPress={onClearRecent}>
                <Text className="text-xs text-gray-500">전체 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center p-3 border-b border-gray-200"
                onPress={() => handleSelectRecent(item)}
              >
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text className="ml-3 text-base text-gray-800 flex-1">
                  {item}
                </Text>
                <Ionicons name="arrow-up-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            style={{ maxHeight: 200 }}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};
