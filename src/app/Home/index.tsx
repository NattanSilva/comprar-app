import { Button } from '@/components/Button'
import { Filter } from '@/components/Filter'
import { Input } from '@/components/Input'
import { Item } from '@/components/Item'
import { itemsStorage, type ItemStorage } from '@/storage/itemsStorage'
import { FilterStatus } from '@/types/FilterStatus'
import { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { styles } from './styles'

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE]

export function Home() {
  const [items, setItems] = useState<ItemStorage[]>([])
  const [filter, setFilter] = useState(FilterStatus.PENDING)
  const [description, setDescription] = useState('')

  async function handleAdd() {
    if (!description.trim()) {
      return Alert.alert(
        'Adicionar',
        'informe a descrição do item para adicionar na lista',
      )
    }

    const newItem = {
      id: Math.random().toString(36).substring(2),
      description,
      status: FilterStatus.PENDING,
    }

    await itemsStorage.add(newItem)

    Alert.alert('Adicionado', `Adicionado ${description}`)
    setFilter(FilterStatus.PENDING)
    setDescription('')
  }

  async function itemsByStatus() {
    try {
      const response = await itemsStorage.getByStatus(filter)
      setItems(response)
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível carregar os itens')
    }
  }

  async function handleRemove(id: string) {
    try {
      await itemsStorage.remove(id)
      await itemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert('Remover', 'Não foi possível remover o item')
    }
  }

  function handleClear() {
    Alert.alert('Limpar', 'Deseja limpar todos os itens?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => onClear(),
      },
    ])
  }

  async function onClear() {
    try {
      await itemsStorage.clear()
      setItems([])
    } catch (error) {
      console.log(error)
      Alert.alert('Limpar', 'Não foi possível limpar os itens')
    }
  }

  async function handleToggleItemStatus(id: string) {
    try {
      await itemsStorage.toggleStatus(id)
      await itemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert('Status', 'Não foi possível alterar o status do item')
    }
  }

  useEffect(() => {
    itemsByStatus()
  }, [filter])

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/logo.png')} style={styles.logo} />
      <View style={styles.form}>
        <Input
          placeholder='O que você precisa comprar?'
          onChangeText={setDescription}
          value={description}
        />
        <Button title='Adicionar' onPress={handleAdd} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter
              key={status}
              status={status}
              isActive={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Item
              data={item}
              onRemove={() => handleRemove(item.id)}
              onStatus={() => handleToggleItemStatus(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Nenhum item aqui.</Text>
          )}
        />
      </View>
    </View>
  )
}
